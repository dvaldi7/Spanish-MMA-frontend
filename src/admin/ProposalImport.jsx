import React, { useState } from 'react';
import api from '../services/api';

// TASK-0051 — Importación de propuestas del extractor (wow-fetch.mjs) al editor de combates.
// Revisión humana OBLIGATORIA: nada se aplica sin selección explícita por combate, y las
// identidades ambiguas o los resultados sin confirmar se importan con field_flag needs_review.
// Reutiliza los endpoints existentes (GET/POST /api/fights/event/:id, GET/POST /api/events):
// sin endpoint nuevo ni escrituras directas en tablas canónicas.

const norm = (s) => String(s ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const ALLOWED_EXTRACTOR_PREFIX = 'wow-fetch-';
const ALLOWED_HOST = 'www.wowmma.com';

const validateProposal = (p) => {
    const errs = [];
    if (!p || typeof p !== 'object' || Array.isArray(p)) return ['El fichero no contiene un objeto JSON de propuesta.'];
    if (!p.meta || typeof p.meta !== 'object') errs.push('Falta meta (procedencia del extractor).');
    if (!p.meta?.extractor_version || !String(p.meta.extractor_version).startsWith(ALLOWED_EXTRACTOR_PREFIX)) {
        errs.push(`meta.extractor_version debe empezar por "${ALLOWED_EXTRACTOR_PREFIX}" (versión no reconocida).`);
    }
    const url = p.meta?.url ?? '';
    try {
        if (new URL(url).host !== ALLOWED_HOST) errs.push(`meta.url debe ser del dominio oficial (${ALLOWED_HOST}).`);
    } catch {
        errs.push('meta.url no es una URL válida.');
    }
    if (!p.meta?.captured_at_utc) errs.push('Falta meta.captured_at_utc (fecha de captura).');
    if (!p.meta?.raw_sha256 || !/^[0-9a-f]{64}$/i.test(p.meta.raw_sha256)) errs.push('Falta meta.raw_sha256 (SHA-256 del fixture crudo).');
    if (!p.event?.title || !p.event?.date) errs.push('Falta event.title o event.date.');
    if (!Array.isArray(p.fights)) errs.push('fights debe ser un array (puede estar vacío).');
    if (p.matching && !Array.isArray(p.matching)) errs.push('matching debe ser un array si está presente.');
    return errs;
};

const boutStateOf = (f) => (f.result_type === 'PARTICIPANT_WIN' && f.winner && f.winner_corner ? 'VERIFICADO' : 'REVISIÓN');

// clave de par para detectar duplicados: usa el ID de ficha cuando el lado es interno
// (resuelve variantes de nombre anunciado vs ficha); si no, el nombre normalizado
const sideKeyOf = (side) => {
    if (!side) return '';
    if (side.mode === 'internal' && side.fighter_id) return `id:${side.fighter_id}`;
    return norm(side.external_name ?? side.announced);
};
const pairKeyOfSides = (redSide, blueSide) => {
    const a = sideKeyOf(redSide), b = sideKeyOf(blueSide);
    return [a, b].sort().join('|');
};
// variante para filas de la BD (participantes con ficha → id)
const pairKeyOfDb = (redName, redFighterId, blueName, blueFighterId) => {
    const a = redFighterId ? `id:${redFighterId}` : norm(redName);
    const b = blueFighterId ? `id:${blueFighterId}` : norm(blueName);
    return [a, b].sort().join('|');
};

const readFileAsText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo leer el fichero.'));
    reader.readAsText(file);
});

// helper: modo efectivo de una identidad derivada
const sel_mode = (identity) => (identity && identity.mode) || 'external';

// matching por esquina del fichero de propuesta (SOURCE_POLICY)
const matchFor = (f, side, matchingList) => {
    const name = f.participants?.[side];
    if (!name) return { match: 'external', candidate: null };
    return (matchingList ?? []).find(
        (m) => m.side === side && norm(m.announced) === norm(name)
    ) ?? { match: 'external', candidate: null };
};

const ProposalImport = ({ events, fighters }) => {
    const [parsedProp, setParsedProp] = useState(null);
    const [errors, setErrors] = useState([]);
    const [eventId, setEventId] = useState(null);
    const [eventMissing, setEventMissing] = useState(null);
    const [duplicates, setDuplicates] = useState([]); // pairKeys ya existentes
    const [unchecked, setUnchecked] = useState({}); // { [index]: true } — el usuario desmarca
    const [overrides, setOverrides] = useState({});
    const [summary, setSummary] = useState(null);
    const [busy, setBusy] = useState(false);

    // identidad efectiva por esquina: override del usuario o sugerencia del matching
    const sideOf = (index, f, side, matchingList) => {
        const own = overrides[index] && overrides[index][`${side}Side`];
        if (own) return own;
        const m = matchFor(f, side, matchingList ?? parsedProp?.matching);
        console.log('WDBG sideOf', JSON.stringify({ index, side, matchListType: typeof matchingList, len: (matchingList ?? parsedProp?.matching ?? []).length, result: m.match, cand: m.candidate }));
        const announced = f.participants?.[side] ?? '';
        if (m.match === 'strong' && m.candidate_fighter_id) {
            return { mode: 'internal', fighter_id: String(m.candidate_fighter_id), external_name: '', ambiguous: false, announced };
        }
        if (m.match === 'ambiguous' && m.candidate_fighter_id) {
            return { mode: 'internal', fighter_id: String(m.candidate_fighter_id), external_name: '', ambiguous: true, announced };
        }
        return { mode: 'external', fighter_id: '', external_name: announced, ambiguous: false, announced };
    };

    const isChecked = (index) => !unchecked[index];
    // duplicado si el par de identidades efectivas (por id de ficha o nombre) ya existe
    const markExisting = (index) => {
        const f = parsedProp.fights[index];
        if (!f) return false;
        return duplicates.includes(pairKeyOfSides(sideOf(index, f, 'red'), sideOf(index, f, 'blue')));
    };

    const syncDuplicates = async (id) => {
        try {
            const res = await api.get(`/fights/event/${id}`);
            const keys = (res.data.fights || []).map((fi) => {
                const red = fi.participants.find((p) => p.corner === 'RED');
                const blue = fi.participants.find((p) => p.corner === 'BLUE');
                return pairKeyOfDb(
                    red?.fighter ? `${red.fighter.first_name} ${red.fighter.last_name}` : red?.external_name,
                    red?.fighter?.fighter_id ?? null,
                    blue?.fighter ? `${blue.fighter.first_name} ${blue.fighter.last_name}` : blue?.external_name,
                    blue?.fighter?.fighter_id ?? null,
                );
            });
            setDuplicates(keys);
        } catch {
            setDuplicates([]);
        }
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSummary(null); setErrors([]); setUnchecked({}); setOverrides({});
        const text = await readFileAsText(file);
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            setErrors(['El fichero no es JSON válido.']);
            return;
        }
        const errs = validateProposal(parsed);
        if (errs.length > 0) { setErrors(errs); return; }

        setParsedProp(parsed);

        const wanted = norm(parsed.event.title);
        const found = (events ?? []).find((ev) => norm(ev.name) === wanted || norm(ev.name).startsWith(wanted));
        if (found) {
            setEventId(found.event_id);
            setEventMissing(null);
            syncDuplicates(found.event_id);
        } else {
            setEventId(null);
            setEventMissing({ title: parsed.event.title, date: parsed.event.date, location: parsed.event.location });
            setDuplicates([]);
        }
    };

    const handleEventResolved = async (id) => {
        setEventId(id); setEventMissing(null);
        syncDuplicates(id);
    };

    const handleCreateEvent = async () => {
        if (!eventMissing) return;
        try {
            const isPast = new Date(eventMissing.date) < new Date().setHours(0, 0, 0, 0);
            const res = await api.post('/events', {
                name: eventMissing.title,
                date: eventMissing.date,
                location: eventMissing.location || '',
                is_completed: isPast ? 'true' : 'false',
            });
            await handleEventResolved(res.data.event_id);
        } catch (err) {
            setErrors([err.response?.status === 409
                ? 'Ya existe un evento con ese nombre (slug).'
                : 'No se pudo crear el evento.']);
        }
    };

    const handleSideOverride = (index, side, patch) => {
        const f = parsedProp?.fights?.[index];
        setOverrides((o) => ({
            ...o,
            [index]: {
                ...o[index],
                [`${side}Side`]: { ...sideOf(index, f, side, parsedProp.matching), ...patch },
            },
        }));
    };

    const buildFightPayload = (index, f) => {
        const payload = {
            bout_order: index + 1,
            nature: f.nature || 'PROFESSIONAL',
            status: f.status || 'COMPLETED',
            participants: [],
        };
        for (const corner of ['RED', 'BLUE']) {
            const side = corner.toLowerCase();
            const sel = sideOf(index, f, side, parsedProp.matching);
            payload.participants.push(
                sel.mode === 'internal' && sel.fighter_id
                    ? { corner, fighter_id: Number(sel.fighter_id) }
                    : { corner, external_name: sel.external_name || f.participants?.[side] || '' },
            );
        }
        payload.result_type = f.result_type ?? 'UNKNOWN';
        if (payload.result_type === 'PARTICIPANT_WIN' && f.winner_corner) payload.winner_corner = f.winner_corner;
        if (f.method_code) payload.method_code = f.method_code;
        if (f.ending_round) payload.ending_round = f.ending_round;
        if (f.round_seconds !== null && f.round_seconds !== undefined) payload.round_seconds = f.round_seconds;
        if (f.scheduled_rounds) payload.scheduled_rounds = f.scheduled_rounds;
        if (f.weight_class) payload.weight_class = f.weight_class;

        let host = 'fuente-oficial';
        try { host = new URL(parsedProp.meta.url).host.replace(/^www\./, ''); } catch { /* fuente por defecto */ }
        payload.source_name = host;
        payload.source_url = parsedProp.meta.url;
        payload.fetched_at = parsedProp.meta.captured_at_utc;
        payload.capture_method = parsedProp.meta.capture_method ?? 'other';
        payload.fixture_sha = parsedProp.meta.text_sha256 ?? parsedProp.meta.raw_sha256;
        payload.extractor_version = parsedProp.meta.extractor_version;
        payload.confidence = boutStateOf(f) === 'VERIFICADO' ? 'C2' : 'C1';

        const ambiguousUnconfirmed = sideOf(index, f, 'red', parsedProp.matching).ambiguous || sideOf(index, f, 'blue', parsedProp.matching).ambiguous;
        payload.field_flag = boutStateOf(f) === 'VERIFICADO' && !ambiguousUnconfirmed ? 'known' : 'needs_review';
        return payload;
    };

    const handleImport = async () => {
        if (!eventId || !parsedProp || !parsedProp.fights) return;
        setBusy(true);
        setErrors([]);
        let imported = 0;
        let omitted = 0;
        const errs = [];
        const rows = parsedProp.fights.map((_, i) => i);
        for (const index of rows) {
            if (!isChecked(index)) { omitted += 1; continue; }
            const f = parsedProp.fights[index];
            const effRed = sideOf(index, f, 'red');
            const effBlue = sideOf(index, f, 'blue');
            if (duplicates.includes(pairKeyOfSides(effRed, effBlue))) { omitted += 1; continue; }
            try {
                await api.post(`/fights/event/${eventId}`, buildFightPayload(index, f));
                imported += 1;
            } catch (err) {
                const resp = err.response;
                const detail = resp?.status === 409
                    ? 'slot duplicado'
                    : (Array.isArray(resp?.data?.errors))
                        ? resp.data.errors.join(' · ')
                        : (resp?.data?.message ?? 'error desconocido');
                errs.push(`${f.participants?.red ?? '—'} vs ${f.participants?.blue ?? '—'}: ${detail}`);
            }
        }
        setSummary({ imported, omitted, errors: errs });
        setBusy(false);
        if (errs.length === 0) syncDuplicates(eventId);
    };

    const proposalReady = parsedProp && eventId !== null && eventMissing === null;
    const totalSelected = parsedProp && parsedProp.fights
        ? parsedProp.fights.map((_, i) => i).filter((i) => isChecked(i) && !markExisting(i)).length
        : 0;

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Importar propuesta del extractor</h3>
            <p className="text-xs text-gray-500 mb-3">
                Fichero JSON generado por <code className="text-xs">wow-fetch.mjs</code> (SOURCE_POLICY).
                Nada se aplica sin tu selección explícita por combate; resultados sin confirmar se importan como pendientes.
            </p>

            <input
                type="file"
                accept="application/json,.json"
                aria-label="Fichero de propuesta JSON"
                onChange={handleFile}
                className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer w-full md:w-auto"
            />

            {errors.length > 0 && (
                <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
                    <ul className="list-disc list-inside space-y-1">{errors.map((err, i) => (<li key={i}>{err}</li>))}</ul>
                </div>
            )}

            {summary && (
                <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-sm" role="status">
                    {`Importados: ${summary.imported} · Omitidos: ${summary.omitted} · Errores: ${summary.errors.length}`}
                    {summary.errors.length > 0 && (
                        <ul className="list-disc list-inside mt-1">{summary.errors.map((err, i) => (<li key={i}>{err}</li>))}</ul>
                    )}
                </div>
            )}

            {parsedProp && eventMissing && (
                <div className="mt-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-sm">
                    <p className="text-yellow-800">
                        El evento «{eventMissing.title}» ({eventMissing.date}) no está en la base de datos.
                    </p>
                    <button type="button" onClick={handleCreateEvent}
                        className="mt-2 bg-black text-white py-2 px-4 rounded font-bold uppercase hover:bg-gray-800 text-sm">
                        Crear evento {eventMissing.title}
                    </button>
                </div>
            )}

            {parsedProp && parsedProp.fights.length === 0 && (
                <p className="mt-4 text-sm text-gray-600 italic">
                    La propuesta no contiene combates (cartelera aún sin publicar en la fuente).
                </p>
            )}

            {proposalReady && parsedProp.fights.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">
                        Combates de la propuesta ({parsedProp.fights.length}) — marca los que quieras importar
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {parsedProp.fights.map((f, i) => {
                            const isDupe = markExisting(i);
                            const state = boutStateOf(f);
                            const redIdentity = sideOf(i, f, 'red', parsedProp.matching);
                            const blueIdentity = sideOf(i, f, 'blue', parsedProp.matching);
                            const winnerLabel = f.result_type === 'PARTICIPANT_WIN' && f.winner
                                ? `${f.winner} (${f.winner_corner === 'Rojo' ? 'Roja' : 'Azul'})`
                                : null;
                            return (
                                <div key={i} className={`p-3 rounded border text-sm ${isDupe ? 'bg-gray-50 border-gray-200' : 'border-gray-300'}`}>
                                    <div className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isChecked(i)}
                                            disabled={isDupe}
                                            onChange={(e) => setUnchecked((u) => ({ ...u, [i]: !e.target.checked }))}
                                            aria-label={`Importar combate ${f.participants?.red} vs ${f.participants?.blue}`}
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800">
                                                {f.participants?.red} vs {f.participants?.blue}
                                                {' '}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${state === 'VERIFICADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {state === 'VERIFICADO' ? 'RESULTADO VERIFICADO' : 'REVISIÓN'}
                                                </span>
                                                {isDupe && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-600 ml-1">
                                                        YA EXISTE (omitido)
                                                    </span>
                                                )}
                                                {!isDupe && state === 'REVISIÓN' && (
                                                    <span className="text-[10px] ml-1 text-yellow-700">
                                                        (se importará como pendiente de revisión)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-gray-600 mt-1">
                                                Resultado de la fuente: {winnerLabel ?? 'pendiente'} ·
                                                método: {f.method_code ?? 'pendiente'}{f.ending_round ? ` R${f.ending_round}` : ''}{f.round_seconds ? ` ${Math.floor(f.round_seconds / 60)}:${String(f.round_seconds % 60).padStart(2, '0')}` : ''}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                {[{ id: 'red', identity: redIdentity, label: 'Roja' }, { id: 'blue', identity: blueIdentity, label: 'Azul' }].map(({ id: side, identity, label }) => (
                                                    <div key={side} className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                            {label}: {identity.announced || '—'}
                                                        </span>
                                                        <select
                                                            key={`${i}-${side}-${sel_mode(identity)}`}
                                                            aria-label={`Identidad ${label.toLowerCase()} para ${f.participants?.red} vs ${f.participants?.blue}`}
                                                            value={sel_mode(identity) === 'internal' ? String(identity.fighter_id) : ''}
                                                            onChange={(e) => handleSideOverride(i, side, {
                                                                mode: e.target.value === '' ? 'external' : 'internal',
                                                                fighter_id: e.target.value,
                                                                external_name: '',
                                                            })}
                                                            className="border rounded p-1 text-xs"
                                                        >
                                                            <option value="">-- rival externo ({identity.announced}) --</option>
                                                            {fighters.map((fi) => (
                                                                <option key={fi.fighter_id} value={fi.fighter_id}>
                                                                    {fi.first_name} {fi.last_name}{identity.ambiguous ? ' ⚠ identidad sugerida' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {identity.ambiguous && (
                                                            <span className="text-[10px] text-yellow-700">
                                                                ⚠ Coincidencia ambigua (homónimos): confirma o cámbiala antes de importar.
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleImport}
                disabled={busy || totalSelected === 0}
                className="mt-4 w-full bg-black text-white py-3 rounded font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400"
            >
                {busy ? 'Importando…' : `Importar ${totalSelected} combate(s)`}
            </button>
        </div>
    );
};

export default ProposalImport;