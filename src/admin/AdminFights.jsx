import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import ProposalImport from './ProposalImport';

const NATURES = ['PROFESSIONAL', 'AMATEUR', 'EXHIBITION'];
const FIGHT_STATUSES = ['DRAFT', 'SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED'];
const METHOD_CODES = [
    { code: 'KO', label: 'KO' },
    { code: 'TKO', label: 'TKO' },
    { code: 'SUBMISSION', label: 'Sumisión' },
    { code: 'DEC_UNANIMOUS', label: 'Decisión unánime' },
    { code: 'DEC_SPLIT', label: 'Decisión dividida' },
    { code: 'DEC_MAJORITY', label: 'Decisión mayoritaria' },
    { code: 'DQ', label: 'Descalificación' },
    { code: 'NO_CONTEST', label: 'No contest' },
    { code: 'OTHER', label: 'Otro' },
];
const CONFIDENCES = [
    { value: 'C3', label: 'C3 · Confirmada (2+ fuentes)' },
    { value: 'C2', label: 'C2 · Fuente oficial única' },
    { value: 'C1', label: 'C1 · Fuente secundaria' },
    { value: 'C0', label: 'C0 · Sin verificar' },
];
const SOURCES = [
    { value: 'wowmma.com', label: 'Web oficial WOW (wowmma.com)' },
    { value: 'tapology_manual', label: 'Tapology (manual)' },
    { value: 'sherdog_manual', label: 'Sherdog (manual)' },
    { value: 'press', label: 'Prensa' },
    { value: 'official_rrss', label: 'RRSS oficial (manual)' },
    { value: 'manual_note', label: 'Nota manual' },
];
const NATURE_LABELS = { PROFESSIONAL: 'Profesional', AMATEUR: 'Amateur', EXHIBITION: 'Exhibición' };
const STATUS_STYLES = {
    COMPLETED: 'bg-green-600 text-white',
    SCHEDULED: 'bg-blue-600 text-white',
    DRAFT: 'bg-gray-500 text-white',
    POSTPONED: 'bg-yellow-600 text-white',
    CANCELLED: 'bg-red-600 text-white',
};

const emptyForm = () => ({
    bout_order: '',
    nature: 'PROFESSIONAL',
    status: 'SCHEDULED',
    result: '', // BLUE | RED | DRAW | NO_CONTEST | UNKNOWN | ''
    method_code: '',
    method_detail: '',
    ending_round: '',
    round_time: '', // mm:ss
    scheduled_rounds: '',
    weight_class: '',
    is_title: false,
    source_name: 'wowmma.com',
    source_url: '',
    fetched_at: '',
    confidence: 'C2',
    red_mode: 'internal',
    red_fighter_id: '',
    red_external_name: '',
    blue_mode: 'internal',
    blue_fighter_id: '',
    blue_external_name: '',
});

// "m:ss" | "m" | segundos → segundos (0..599)
const parseRoundTime = (raw) => {
    if (raw === undefined || raw === null || String(raw).trim() === '') return { ok: true, value: null };
    const s = String(raw).trim().replace(/^0+(?=\d)/, '');
    if (!/^\d{1,2}(:\d{1,2})?$/.test(s)) return { ok: false };
    const parts = s.split(':');
    let minutes = 0, seconds = 0;
    if (parts.length === 2) { minutes = parseInt(parts[0], 10); seconds = parseInt(parts[1], 10); }
    else { minutes = parseInt(parts[0], 10); seconds = 0; }
    const total = minutes * 60 + seconds;
    if (total > 599) return { ok: false };
    return { ok: true, value: total };
};

const participantPayloadFor = (corner, form) => {
    if (form[`${corner.toLowerCase()}_mode`] === 'external' && form[`${corner.toLowerCase()}_external_name`]) {
        return { corner, external_name: form[`${corner.toLowerCase()}_external_name`].trim() };
    }
    if (form[`${corner.toLowerCase()}_mode`] === 'internal' && form[`${corner.toLowerCase()}_fighter_id`]) {
        return { corner, fighter_id: Number(form[`${corner.toLowerCase()}_fighter_id`]) };
    }
    return null;
};

const AdminFights = () => {
    const [events, setEvents] = useState([]);
    const [fighters, setFighters] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [fights, setFights] = useState([]);
    const [loadingFights, setLoadingFights] = useState(false);
    const [pageError, setPageError] = useState(null);
    const [notice, setNotice] = useState(null);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editingFightId, setEditingFightId] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadEvents = async () => {
        try {
            const res = await api.get('/events?page=1&limit=100');
            setEvents(res.data.events || []);
        } catch {
            setPageError('No se pudieron cargar los eventos. Refresca la página.');
        }
    };

    const loadFighters = async () => {
        try {
            const all = [];
            let page = 1;
            let hasMore = true;
            while (hasMore && page <= 10) {
                const res = await api.get(`/fighters?page=${page}&limit=50`);
                const rows = res.data.fighters || [];
                all.push(...rows);
                hasMore = rows.length > 0;
                page += 1;
            }
            setFighters(all);
        } catch {
            setPageError((prev) => prev || 'No se pudieron cargar los peleadores para el selector.');
        }
    };

    useEffect(() => {
        loadEvents();
        loadFighters();
    }, []);

    const loadFights = async (eventId) => {
        if (!eventId) { setFights([]); return; }
        setLoadingFights(true);
        try {
            const res = await api.get(`/fights/event/${eventId}`);
            setFights(res.data.fights || []);
        } catch {
            setPageError('No se pudieron cargar los combates del evento.');
        } finally {
            setLoadingFights(false);
        }
    };

    const handleSelectEvent = (e) => {
        const id = e.target.value;
        setSelectedEventId(id);
        setNotice(null); setPageError(null);
        loadFights(id);
    };

    const nextSuggestedSlot = useMemo(() => {
        const used = fights.map((f) => f.bout_order).filter((v) => v !== null && v !== undefined);
        if (used.length === 0) return 1;
        return Math.max(...used) + 1;
    }, [fights]);

    const openCreate = () => {
        setEditingFightId(null);
        setErrors([]);
        setForm({ ...emptyForm(), bout_order: String(nextSuggestedSlot) });
        setEditorOpen(true);
    };

    const openEdit = (f) => {
        setEditingFightId(f.fight_id);
        setErrors([]);
        setForm((prev) => ({
            ...prev,
            bout_order: f.bout_order !== null && f.bout_order !== undefined ? String(f.bout_order) : '',
            nature: f.nature,
            status: f.status,
            result: f.result_type === 'PARTICIPANT_WIN'
                ? (f.winner_participant_id
                    ? (f.participants.find((p) => p.participant_id === f.winner_participant_id)?.corner || '')
                    : '')
                : (f.result_type || ''),
            method_code: f.method_code || '',
            method_detail: f.method_detail || '',
            ending_round: f.ending_round !== null && f.ending_round !== undefined ? String(f.ending_round) : '',
            round_time: f.round_seconds !== null && f.round_seconds !== undefined
                ? `${Math.floor(f.round_seconds / 60)}:${String(f.round_seconds % 60).padStart(2, '0')}`
                : '',
            scheduled_rounds: f.scheduled_rounds !== null && f.scheduled_rounds !== undefined ? String(f.scheduled_rounds) : '',
            weight_class: f.weight_class || '',
            is_title: !!f.is_title,
            source_name: f.source_name || '',
            source_url: f.source_url || '',
            fetched_at: f.fetched_at ? String(f.fetched_at).slice(0, 16) : '',
            confidence: f.confidence || '',
        }));
        setEditorOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const buildPayload = (isCreate) => {
        const payload = {
            nature: form.nature,
            status: form.status,
        };
        if (form.bout_order) payload.bout_order = Number(form.bout_order);

        const wantsResultStatus = form.status === 'COMPLETED';
        const resultType = wantsResultStatus
            ? (form.result === 'DRAW' ? 'DRAW' : form.result === 'NO_CONTEST' ? 'NO_CONTEST' : 'PARTICIPANT_WIN')
            : undefined;

        // resultado solo tiene sentido en COMPLETED
        if (wantsResultStatus) {
            payload.result_type = resultType || 'UNKNOWN';
            if (payload.result_type === 'PARTICIPANT_WIN' && form.result === 'RED') payload.winner_corner = 'RED';
            if (payload.result_type === 'PARTICIPANT_WIN' && form.result === 'BLUE') payload.winner_corner = 'BLUE';
            if (form.method_code) payload.method_code = form.method_code;
            if (form.method_detail) payload.method_detail = form.method_detail;
            const round = form.ending_round ? Number(form.ending_round) : null;
            if (form.ending_round) payload.ending_round = round;
            const time = parseRoundTime(form.round_time);
            if (time.ok && time.value !== null) payload.round_seconds = time.value;
        } else {
            // sin resultado: limpiar campos de resultado si vienen en edición
            payload.result_type = null;
        }
        if (form.scheduled_rounds) payload.scheduled_rounds = Number(form.scheduled_rounds);
        if (form.weight_class) payload.weight_class = form.weight_class;
        payload.is_title = form.is_title ? 1 : 0;

        if (form.source_name) payload.source_name = form.source_name;
        if (form.source_url) payload.source_url = form.source_url;
        if (form.fetched_at) payload.fetched_at = new Date(`${form.fetched_at}:00Z`).toISOString();
        if (form.confidence) payload.confidence = form.confidence;

        if (isCreate) {
            const redP = participantPayloadFor('RED', form);
            const blueP = participantPayloadFor('BLUE', form);
            payload.participants = [redP, blueP].filter(Boolean);
        }
        return payload;
    };

    // Validación del lado del cliente (los mensajes espejan las reglas del backend)
    const clientValidate = (isCreate) => {
        const errs = [];
        if (!form.nature) errs.push('Selecciona la naturaleza del combate.');
        if (isCreate) {
            const redP = participantPayloadFor('RED', form);
            const blueP = participantPayloadFor('BLUE', form);
            if (!redP) errs.push('Falta el participante de la esquina ROJA (peleador o rival externo).');
            if (!blueP) errs.push('Falta el participante de la esquina AZUL (peleador o rival externo).');
            if (redP && blueP && redP.fighter_id && blueP.fighter_id && redP.fighter_id === blueP.fighter_id) {
                errs.push('Un mismo peleador no puede ocupar las dos esquinas.');
            }
        }
        if (form.status === 'COMPLETED') {
            if (!form.result) errs.push('Indica el resultado del combate (victoria RED/BLUE, empate o no contest).');
            if (form.result === 'DRAW' || form.result === 'NO_CONTEST') {
                if (form.method_code) errs.push('Un empate o no contest no admite método de victoria.'); 
            }
            if (!form.source_name) errs.push('Indica la fuente del resultado (procedencia mínima).');
            if (form.result === 'RED' || form.result === 'BLUE') {
                if (!form.method_code) errs.push('Indica el método de la victoria.');
                if (['KO', 'TKO', 'SUBMISSION'].includes(form.method_code) && !form.ending_round) {
                    errs.push('Una finalización (KO/TKO/Sumisión) exige el asalto.');
                }
                if (['KO', 'TKO', 'SUBMISSION'].includes(form.method_code) && form.round_time && !parseRoundTime(form.round_time).ok) {
                    errs.push('El tiempo debe indicarse como m:ss (máx. 9:59).');
                }
                if (['KO', 'TKO', 'SUBMISSION'].includes(form.method_code) && !form.round_time) {
                    errs.push('Una finalización (KO/TKO/Sumisión) exige el tiempo.');
                }
            }
        }
        if (form.ending_round && (Number(form.ending_round) < 1 || Number(form.ending_round) > 99)) {
            errs.push('El asalto debe ser un entero entre 1 y 99.');
        }
        if (form.round_time && !parseRoundTime(form.round_time).ok) {
            errs.push('El tiempo debe indicarse como m:ss (máx. 9:59).');
        }
        return errs;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const isCreate = editingFightId === null;
        const errs = clientValidate(isCreate);
        if (errs.length > 0) {
            setErrors(errs);
            return;
        }
        setErrors([]);
        setSaving(true);
        setNotice(null);
        try {
            const payload = buildPayload(isCreate);
            if (isCreate) {
                await api.post(`/fights/event/${selectedEventId}`, payload);
                setNotice('Combate creado con éxito.');
            } else {
                await api.put(`/fights/id/${editingFightId}`, payload);
                setNotice('Combate actualizado con éxito.');
            }
            setEditorOpen(false);
            await loadFights(selectedEventId);
        } catch (error) {
            const resp = error.response;
            if (resp && resp.status === 409) {
                setErrors(['Ese orden (bout_order) ya está ocupado en este evento. Elige otro número.']);
            } else if (resp && resp.status === 400 && resp.data && Array.isArray(resp.data.errors)) {
                setErrors(resp.data.errors);
            } else if (resp && resp.status === 401) {
                setErrors(['Sesión caducada. Vuelve a iniciar sesión.']);
            } else {
                setErrors(['No se pudo guardar el combate. Inténtalo de nuevo.']);
            }
        } finally {
            setSaving(false);
        }
    };

    const participantLabel = (p) => (p.fighter
        ? `${p.fighter.first_name} ${p.fighter.last_name}`
        : (p.external_name || '—'));

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-b from-custom-red to-custom-gold bg-clip-text text-transparent">
                Combates estructurados
            </h2>

            {notice && (
                <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-sm" role="status">{notice}</div>
            )}
            {pageError && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm" role="alert">{pageError}</div>
            )}

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <label htmlFor="event-select" className="block text-sm font-bold text-gray-700 mb-2">
                    Evento
                </label>
                <select
                    id="event-select"
                    value={selectedEventId}
                    onChange={handleSelectEvent}
                    className="border border-gray-300 rounded p-2 text-sm w-full max-w-md"
                >
                    <option value="">-- Seleccionar evento --</option>
                    {events.map((ev) => (
                        <option key={ev.event_id} value={ev.event_id}>
                            {ev.name}{ev.date ? ` (${String(ev.date).slice(0, 10)})` : ''}
                        </option>
                    ))}
                </select>

                {selectedEventId && (
                    <button
                        type="button"
                        onClick={openCreate}
                        className="mt-3 ml-0 md:ml-4 block md:inline w-full md:w-auto bg-black text-white py-2 px-4 rounded font-bold uppercase hover:bg-gray-800 text-sm"
                    >
                        + Añadir combate
                    </button>
                )}
            </div>

            <ProposalImport events={events} fighters={fighters} />

            {selectedEventId && loadingFights && <p className="text-gray-600">Cargando combates…</p>}

            {selectedEventId && !loadingFights && fights.length === 0 && (
                <p className="text-gray-600 italic">Este evento no tiene combates estructurados todavía.</p>
            )}

            {selectedEventId && fights.length > 0 && (
                <div className="space-y-3">
                    {fights.map((f) => {
                        const red = f.participants.find((p) => p.corner === 'RED');
                        const blue = f.participants.find((p) => p.corner === 'BLUE');
                        const winner = f.participants.find((p) => p.participant_id === f.winner_participant_id);
                        const winnerLabel = winner ? participantLabel(winner) : null;
                        return (
                            <div key={f.fight_id} className="bg-white rounded-lg shadow p-3 border-l-4 border-custom-red">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            #{f.bout_order ?? '—'} · {NATURE_LABELS[f.nature]} · {f.status}
                                        </div>
                                        <div className="font-bold text-sm md:text-base text-gray-800">
                                            <span className={f.result_type === 'PARTICIPANT_WIN' && f.winner_participant_id === red?.participant_id ? 'text-green-700' : ''}>
                                                {participantLabel(red)}
                                            </span>
                                            <span className="mx-2 text-custom-red">vs</span>
                                            <span className={f.result_type === 'PARTICIPANT_WIN' && f.winner_participant_id === blue?.participant_id ? 'text-green-700' : ''}>
                                                {participantLabel(blue)}
                                            </span>
                                            {!red?.fighter && <span className="text-xs text-gray-400 ml-1">(externo)</span>}
                                            {!blue?.fighter && blue?.external_name && <span className="text-xs text-gray-400 ml-1">(externo)</span>}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {f.result_type === 'PARTICIPANT_WIN' && winnerLabel && (
                                                <span className="font-semibold text-green-700 mr-2">Ganador: {winnerLabel}</span>
                                            )}
                                            {f.result_type === 'DRAW' && <span className="mr-2">Empate</span>}
                                            {f.result_type === 'NO_CONTEST' && <span className="mr-2">No contest</span>}
                                            {f.method_code && (
                                                <span className="mr-2">
                                                    {METHOD_CODES.find((m) => m.code === f.method_code)?.label || f.method_code}
                                                    {f.ending_round ? ` R${f.ending_round}` : ''}
                                                    {f.round_seconds !== null && f.round_seconds !== undefined ? ` ${Math.floor(f.round_seconds / 60)}:${String(f.round_seconds % 60).padStart(2, '0')}` : ''}
                                                </span>
                                            )}
                                            {f.source_name && (
                                                <span className="text-gray-500" title={`Confianza: ${f.confidence || 'sin nivel'}`}>
                                                    · Fuente: {f.source_name}{f.confidence ? ` (${f.confidence})` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs md:flex md:items-center gap-2">
                                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[f.status]}`}>
                                            {f.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => openEdit(f)}
                                            className="text-gray-700 underline hover:text-black"
                                        >
                                            Editar resultado
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editorOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50" role="dialog" aria-modal="true">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold">
                                {editingFightId ? 'Editar combate' : 'Nuevo combate'}
                            </h3>
                            <button type="button" onClick={() => setEditorOpen(false)} className="text-gray-500 hover:text-black" aria-label="Cerrar">
                                ✕
                            </button>
                        </div>

                        {errors.length > 0 && (
                            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((err, i) => (<li key={i}>{err}</li>))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="bout_order">Orden (1=principal)</label>
                                    <input id="bout_order" name="bout_order" type="number" min="1" max="99" value={form.bout_order} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="nature">Naturaleza</label>
                                    <select id="nature" name="nature" value={form.nature} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                        {NATURES.map((n) => (<option key={n} value={n}>{NATURE_LABELS[n]}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="status">Estado</label>
                                    <select id="status" name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                        {FIGHT_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="scheduled_rounds">Asaltos pactados</label>
                                    <input id="scheduled_rounds" name="scheduled_rounds" type="number" min="1" max="25" value={form.scheduled_rounds} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <fieldset className="border p-3 rounded">
                                    <legend className="text-xs font-bold text-red-600">Esquina ROJA</legend>
                                    <select name="red_mode" value={form.red_mode} onChange={handleChange} className="w-full border rounded p-2 text-sm mb-2">
                                        <option value="internal">Peleador registrado</option>
                                        <option value="external">Rival externo</option>
                                    </select>
                                    {form.red_mode === 'internal' ? (
                                        <select name="red_fighter_id" value={form.red_fighter_id} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                            <option value="">-- Peleador --</option>
                                            {fighters.map((f) => (
                                                <option key={f.fighter_id} value={f.fighter_id}>{f.first_name} {f.last_name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input name="red_external_name" value={form.red_external_name} onChange={handleChange}
                                            placeholder="Nombre del rival externo" className="w-full border rounded p-2 text-sm" />
                                    )}
                                </fieldset>
                                <fieldset className="border p-3 rounded">
                                    <legend className="text-xs font-bold text-blue-700">Esquina AZUL</legend>
                                    <select name="blue_mode" value={form.blue_mode} onChange={handleChange} className="w-full border rounded p-2 text-sm mb-2">
                                        <option value="internal">Peleador registrado</option>
                                        <option value="external">Rival externo</option>
                                    </select>
                                    {form.blue_mode === 'internal' ? (
                                        <select name="blue_fighter_id" value={form.blue_fighter_id} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                            <option value="">-- Peleador --</option>
                                            {fighters.map((f) => (
                                                <option key={f.fighter_id} value={f.fighter_id}>{f.first_name} {f.last_name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input name="blue_external_name" value={form.blue_external_name} onChange={handleChange}
                                            placeholder="Nombre del rival externo" className="w-full border rounded p-2 text-sm" />
                                    )}
                                </fieldset>
                            </div>

                            {form.status === 'COMPLETED' && (
                                <div className="border p-3 rounded bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="result">Resultado</label>
                                            <select id="result" name="result" value={form.result} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                                <option value="">-- Seleccionar --</option>
                                                <option value="RED">Gana esquina ROJA</option>
                                                <option value="BLUE">Gana esquina AZUL</option>
                                                <option value="DRAW">Empate</option>
                                                <option value="NO_CONTEST">No contest</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="method_code">Método</label>
                                            <select id="method_code" name="method_code" value={form.method_code} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                                <option value="">-- Seleccionar --</option>
                                                {METHOD_CODES.map((m) => (<option key={m.code} value={m.code}>{m.label}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    {(form.result === 'RED' || form.result === 'BLUE') && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="method_detail">Detalle del método</label>
                                                <input id="method_detail" name="method_detail" value={form.method_detail} onChange={handleChange}
                                                    placeholder="Ej: Rear-Naked Choke" className="w-full border rounded p-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="ending_round">Asalto final</label>
                                                <input id="ending_round" name="ending_round" type="number" min="1" max="25" value={form.ending_round} onChange={handleChange}
                                                    className="w-full border rounded p-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="round_time">Tiempo (m:ss)</label>
                                                <input id="round_time" name="round_time" value={form.round_time} onChange={handleChange}
                                                    placeholder="2:04" className="w-full border rounded p-2 text-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border p-3 rounded bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="source_name">Fuente</label>
                                        <select id="source_name" name="source_name" value={form.source_name} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                            {SOURCES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                            <option value="">-- Sin fuente --</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="confidence">Nivel de confianza</label>
                                        <select id="confidence" name="confidence" value={form.confidence} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                            {CONFIDENCES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                                            <option value="">-- Sin nivel --</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="source_url">URL de la fuente</label>
                                        <input id="source_url" name="source_url" value={form.source_url} onChange={handleChange}
                                            className="w-full border rounded p-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="fetched_at">Fecha de consulta</label>
                                        <input id="fetched_at" name="fetched_at" type="datetime-local" value={form.fetched_at} onChange={handleChange}
                                            className="w-full border rounded p-2 text-sm" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="is_title" name="is_title" type="checkbox" checked={form.is_title} onChange={handleChange} />
                                        <label htmlFor="is_title" className="text-xs font-bold text-gray-600">Combate por título</label>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1" htmlFor="weight_class">Categoría de peso</label>
                                        <input id="weight_class" name="weight_class" value={form.weight_class} onChange={handleChange}
                                            className="w-full border rounded p-2 text-sm" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={saving}
                                className="w-full bg-black text-white py-3 rounded font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400">
                                {saving ? 'Guardando…' : editingFightId ? 'Guardar cambios' : 'Crear combate'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFights;
