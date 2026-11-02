import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProposalImport from './ProposalImport';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock('../services/api', () => ({ default: api }));

const events = [
    { event_id: 13, name: 'AFL 41', date: '2026-09-12' },
    { event_id: 19, name: 'WOW 33: Vitoria', date: '2026-10-24' },
];
const fighters = [
    { fighter_id: 22, first_name: 'Borja', last_name: 'García', nickname: 'El Águila' },
    { fighter_id: 46, first_name: 'Ander', last_name: 'Sánchez', nickname: 'El Rey en el Norte' },
    { fighter_id: 53, first_name: 'Arkaitz', last_name: 'Ramos', nickname: 'Gudari' },
    { fighter_id: 81, first_name: 'Mohamed', last_name: 'El Karchouh', nickname: '' },
];

const proposal = {
    meta: {
        created_at_utc: '2026-11-02T10:15:20Z',
        url: 'https://www.wowmma.com/wow-events/wow-33-vitoria',
        http_status: 200,
        raw_bytes: 124866,
        raw_sha256: 'a'.repeat(64),
        text_sha256: 'b'.repeat(64),
        captured_at_utc: '2026-11-02T10:15:20Z',
        capture_method: 'official_site',
        extractor_version: 'wow-fetch-1.0.0',
        source_policy: 'SOURCE_POLICY.md',
    },
    event: { title: 'WOW 33: Vitoria', date: '2026-10-24', location: 'Vitoria' },
    fights: [
        {
            participants: { red: 'Ander Sánchez', blue: 'Borja García' },
            nature: 'PROFESSIONAL', status: 'COMPLETED',
            result_type: 'PARTICIPANT_WIN', winner: 'Ander Sánchez', winner_corner: 'Rojo',
            method_natural: 'UD', method_code: 'DEC_UNANIMOUS', method_detail: null,
            ending_round: null, round_seconds: null, scheduled_rounds: 3,
            weight_class: 'Bantamweight',
        },
        {
            participants: { red: 'Yaman El Diamante', blue: 'Ubay González' },
            nature: 'PROFESSIONAL', status: 'COMPLETED',
            result_type: 'PARTICIPANT_WIN', winner: 'Yaman El Diamante', winner_corner: 'Rojo',
            method_natural: 'KO', method_code: 'KO', method_detail: null,
            ending_round: 2, round_seconds: 105, scheduled_rounds: null,
            weight_class: 'Bantamweight',
        },
        {
            participants: { red: 'Moustafa El Karchouh', blue: 'Izadi Fre' },
            nature: 'PROFESSIONAL', status: 'COMPLETED',
            result_type: 'UNKNOWN', winner: null, winner_corner: null,
            method_natural: 'UD', method_code: 'DEC_UNANIMOUS', method_detail: null,
            ending_round: null, round_seconds: null, scheduled_rounds: 3,
            weight_class: 'Featherweight',
        },
    ],
    pending_extractor: [],
    matching: [
        { bout: 'Ander Sánchez vs Borja García', side: 'red', announced: 'Ander Sánchez', match: 'strong', candidate_fighter_id: 46 },
        { bout: 'Ander Sánchez vs Borja García', side: 'blue', announced: 'Borja García', match: 'strong', candidate_fighter_id: 22 },
        { bout: 'Moustafa El Karchouh vs Izadi Fre', side: 'red', announced: 'Moustafa El Karchouh', match: 'ambiguous', candidate_fighter_id: 81 },
        { bout: 'Yaman El Diamante vs Ubay González', side: 'red', announced: 'Yaman El Diamante', match: 'external', candidate_fighter_id: null },
        { bout: 'Yaman El Diamante vs Ubay González', side: 'blue', announced: 'Ubay González', match: 'external', candidate_fighter_id: null },
        { bout: 'Moustafa El Karchouh vs Izadi Fre', side: 'blue', announced: 'Izadi Fre', match: 'external', candidate_fighter_id: null },
    ],
};

const fileOf = (obj, name = 'prop.json') => new File([JSON.stringify(obj)], name, { type: 'application/json' });

const pickFile = async (obj) => {
    const input = screen.getByLabelText(/Fichero de propuesta JSON/i);
    await fireEvent.change(input, { target: { files: [fileOf(obj)] } });
    // el flujo de carga es asíncrono (FileReader + validación + resolución del evento):
    // esperar a que la propuesta produzca su resultado visible
    await waitFor(() => {
        const done = screen.queryByText(/Combates de la propuesta/) ||
            screen.queryByText(/no está en la base de datos/) ||
            screen.queryByText(/La propuesta no contiene combates/) ||
            screen.queryByText(/no es JSON válido/) ||
            screen.queryByText(/versión no reconocida/) ||
            screen.queryAllByText(/procedencia del extractor/i).length > 0;
            screen.queryByText(/Coincidencia ambigua/i) ||
            (screen.queryAllByText(/procedencia del extractor/i).length > 0);
        if (!done) throw new Error('propuesta aún procesando');
    }, { timeout: 2000 });
};

beforeEach(() => {
    api.post.mockReset();
    api.get.mockReset();
    api.get.mockImplementation((url) => {
        if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 0, fights: [] } });
        return Promise.reject(new Error('url ' + url));
    });
});

describe('ProposalImport — contrato del extractor', () => {
    it('JSON inválido → error visible sin tocar la BD', async () => {
        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile({ nope: true });
        expect((await screen.findAllByText(/Falta meta/i)).length).toBeGreaterThanOrEqual(3);
        expect(api.get).not.toHaveBeenCalled();
    });

    it('extractor versión no reconocida → rechazado', async () => {
        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile({ ...proposal, meta: { ...proposal.meta, extractor_version: 'other-1.0' } });
        expect(await screen.findByText(/wow-fetch-/i)).toBeTruthy();
    });

    it('propuesta válida: evento encontrado y vista previa con identidades sugeridas', async () => {
        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(proposal);
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/fights/event/19'));
        expect((await screen.findAllByText(/RESULTADO VERIFICADO/)).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/REVISIÓN/).length).toBeGreaterThanOrEqual(1);

        // identidad strong preseleccionada (Ander Sánchez id 46)
        const red1 = screen.getByLabelText(/Identidad roja para Ander Sánchez/i);
        expect(red1.value).toBe('46');
    });

    it('identidad ambigua aparece marcada para confirmación explícita', async () => {
        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(proposal);
        const warnings = await screen.findAllByText(/Coincidencia ambigua/i);
        expect(warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('evento inexistente: ofrece crearlo (sin importar silenciosamente)', async () => {
        const p = { ...proposal, event: { title: 'WOW 34: Valencia', date: '2026-11-21', location: 'Valencia' } };
        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(p);
        expect(await screen.findByText(/no está en la base de datos/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /Crear evento WOW 34: Valencia/ })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /Crear evento WOW 34: Valencia/ }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/events', expect.objectContaining({ name: 'WOW 34: Valencia', is_completed: 'false' })));
    });

    it('importación: envía solo los seleccionados, dedupe por participantes y campo needs_review para lo ambiguo/pendiente', async () => {
        api.post.mockImplementation((url) => {
            if (url === '/events') return Promise.resolve({ data: { event_id: 42 } });
            return Promise.resolve({ data: { fight_id: 1 } });
        });
        // evento con UN combate ya existente (duplicado de la primera propuesta)
        api.get.mockImplementation((url) => {
            if (url.startsWith('/fights/event/19')) {
                return Promise.resolve({
                    data: {
                        results: 1,
                        fights: [{
                            fight_id: 77, event_id: 19, bout_order: 1, nature: 'PROFESSIONAL', status: 'COMPLETED',
                            result_type: 'PARTICIPANT_WIN', winner_participant_id: 101, method_code: 'DEC_UNANIMOUS',
                            source_name: 'wowmma.com', confidence: 'C2', field_flag: 'known',
                            participants: [
                                { participant_id: 101, corner: 'RED', fighter_id: 46, external_name: null, fighter: { fighter_id: 46, first_name: 'Ander', last_name: 'Sánchez', slug: 'x' } },
                                { participant_id: 102, corner: 'BLUE', fighter_id: 22, external_name: null, fighter: { fighter_id: 22, first_name: 'Borja', last_name: 'García', slug: 'y' } },
                            ],
                        }],
                    },
                });
            }
            return Promise.resolve({ data: { results: 0, fights: [] } });
        });

        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(proposal);
        await waitFor(() => expect(screen.getByText(/YA EXISTE \(omitido\)/)).toBeTruthy());

        // importar: el duplicado se omite; el ambiguo se importa con needs_review
        fireEvent.click(screen.getByRole('button', { name: /Importar \d+ combate\(s\)/ }));
        await waitFor(() => expect(screen.getByText(/Importados: 2/)).toBeTruthy(), { timeout: 2500 });
        expect(api.post.mock.calls.filter((c) => String(c[0]).startsWith('/fights/event/')).length).toBe(2);

        // el ambiguo se importa como INTERNAL con el candidato sugerido (81) + needs_review
        const ambiguousPayload = api.post.mock.calls.map((c) => c[1]).find((b) => b.participants?.some((p) => p.fighter_id === 81));
        expect(ambiguousPayload.field_flag).toBe('needs_review');
        expect(ambiguousPayload.result_type).toBe('UNKNOWN');
        expect(ambiguousPayload.source_name).toBe('wowmma.com');
        expect(ambiguousPayload.extractor_version).toBe('wow-fetch-1.0.0');

        const verifiedPayload = api.post.mock.calls.map((c) => c[1]).find((b) => b.participants?.some((p) => p.external_name === 'Ubay González'));
        expect(verifiedPayload.field_flag).toBe('known');
        expect(verifiedPayload.winner_corner).toBe('Rojo'); // esquina del ganador en la propuesta
        expect(verifiedPayload.participants[0].corner).toBe('RED');
        expect(verifiedPayload.participants[1].external_name).toBe('Ubay González');
    });

    it('importación repetida: si todo existe en la BD, todo se omite (0 POST)', async () => {
        api.get.mockImplementation((url) => {
            if (url.startsWith('/fights/event/19')) {
                return Promise.resolve({
                    data: {
                        results: 3,
                        fights: proposal.fights.map((f, i) => ({
                            fight_id: 500 + i, event_id: 19, bout_order: i + 1, nature: 'PROFESSIONAL', status: f.status,
                            result_type: f.result_type ?? null, winner_participant_id: null, method_code: f.method_code ?? null,
                            source_name: 'wowmma.com', confidence: 'C2', field_flag: 'known',
                            participants: [
                                { participant_id: 701 + i * 2, corner: 'RED', fighter_id: f.participants.red === 'Ander Sánchez' ? 46 : (f.participants.red === 'Moustafa El Karchouh' ? 81 : null), external_name: (f.participants.red === 'Ander Sánchez' || f.participants.red === 'Moustafa El Karchouh') ? null : f.participants.red, fighter: f.participants.red === 'Ander Sánchez' ? { fighter_id: 46, first_name: 'Ander', last_name: 'Sánchez', slug: 'x' } : (f.participants.red === 'Moustafa El Karchouh' ? { fighter_id: 81, first_name: 'Mohamed', last_name: 'El Karchouh', slug: 'z' } : null) },
                                { participant_id: 702 + i * 2, corner: 'BLUE', fighter_id: f.participants.blue === 'Borja García' ? 22 : null, external_name: f.participants.blue === 'Borja García' ? null : f.participants.blue, fighter: f.participants.blue === 'Borja García' ? { fighter_id: 22, first_name: 'Borja', last_name: 'García', slug: 'y' } : null },
                            ],
                        })),
                    },
                });
            }
            return Promise.resolve({ data: { results: 0, fights: [] } });
        });

        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(proposal);
        await waitFor(() => {
            const all = screen.getAllByText(/YA EXISTE \(omitido\)/);
            expect(all.length).toBe(3);
        });
        expect(screen.getByRole('button', { name: /Importar 0 combate\(s\)/ })).toBeTruthy();
        expect(api.post).not.toHaveBeenCalledWith(expect.stringMatching(/\/fights\/event/), expect.anything());
    });

    it('fallo parcial: los errores se listan por combate y no abortan el resto', async () => {
        let n = 0;
        api.post.mockImplementation((url) => {
            n += 1;
            if (url === '/events') return Promise.resolve({ data: { event_id: 42 } });
            if (n === 1) return Promise.reject({ response: { status: 409 } });
            return Promise.resolve({ data: { fight_id: 1 } });
        });
        api.get.mockImplementation((url) => {
            if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 0, fights: [] } });
            return Promise.resolve({ data: { results: 0, fights: [] } });
        });

        render(<ProposalImport events={events} fighters={fighters} />);
        await pickFile(proposal);
        fireEvent.click(await screen.findByRole('button', { name: /Importar 3 combate\(s\)/ }));
        await waitFor(() => expect(screen.getByText(/Errores: 1/)).toBeTruthy());
        expect(screen.getByText(/slot duplicado/)).toBeTruthy();
        expect(screen.getByText(/Importados: 2/)).toBeTruthy();
    });
});
