import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminFights from './AdminFights';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));

vi.mock('../services/api', () => ({
    default: api,
}));

const eventList = [
    { event_id: 1, name: 'AFL 41', date: '2026-09-12' },
    { event_id: 2, name: 'WOW 33: Vitoria', date: '2026-10-24' },
];

const fightJoined = (over = {}) => ({
    fight_id: 5,
    event_id: 2,
    bout_order: 1,
    nature: 'PROFESSIONAL',
    status: 'COMPLETED',
    result_type: 'PARTICIPANT_WIN',
    winner_participant_id: 101,
    method_code: 'TKO',
    method_detail: 'Ground & Pound',
    ending_round: 2,
    round_seconds: 124,
    scheduled_rounds: 3,
    weight_class: 'Peso Gallo',
    is_title: 1,
    replaces_fight_id: null,
    source_name: 'wowmma.com',
    source_url: 'https://www.wowmma.com/wow-events/wow-33-vitoria',
    fetched_at: '2026-10-30T08:30:00.000Z',
    capture_method: 'official_site',
    confidence: 'C2',
    field_flag: 'known',
    updated_at: '2026-10-30T08:35:00.000Z',
    participants: [
        { participant_id: 101, corner: 'RED', fighter_id: 1, external_name: null, announced_name: null, fighter: { fighter_id: 1, first_name: 'Ander', last_name: 'Sánchez', nickname: null, slug: 'ander-sanchez', photo_url: null } },
        { participant_id: 102, corner: 'BLUE', fighter_id: null, external_name: 'Rival Externo', announced_name: null, fighter: null },
    ],
    ...over,
});

const mountAndPickEvent = async (optionName) => {
    render(<AdminFights />);
    // Esperar a que los eventos estén en el select antes de cambiar su valor (React no emite
    // change cuando el valor no corresponde a ninguna opción todavía)
    await screen.findByRole('option', { name: optionName === 1 ? /AFL 41/ : /WOW 33: Vitoria/ });
    fireEvent.change(screen.getByRole('combobox', { name: /Evento/i }), { target: { value: String(optionName) } });
};

beforeEach(() => {
    api.post.mockReset();
    api.put.mockReset();
    api.get.mockReset();
    api.get.mockImplementation((url) => {
        if (url.startsWith('/events')) return Promise.resolve({ data: { events: eventList, pagination: {} } });
        if (url.startsWith('/fighters')) return Promise.resolve({ data: { fighters: [{ fighter_id: 1, first_name: 'Ander', last_name: 'Sánchez' }, { fighter_id: 2, first_name: 'Ubay', last_name: 'González' }], pagination: {} } });
        if (url.startsWith('/fights/event/2')) return Promise.resolve({ data: { results: 1, fights: [fightJoined()] } });
        if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 0, fights: [] } });
        return Promise.reject(new Error('url inesperada: ' + url));
    });
});

describe('AdminFights', () => {
    it('carga eventos y peleadores para los selectores', async () => {
        render(<AdminFights />);
        await screen.findByRole('option', { name: /WOW 33: Vitoria/ });
        expect(api.get).toHaveBeenCalledWith('/events?page=1&limit=100');
        expect(api.get).toHaveBeenCalledWith('/fighters?page=1&limit=50');
    });

    it('muestra el estado vacío cuando el evento elegido no tiene combates', async () => {
        await mountAndPickEvent(1);
        await waitFor(() => expect(screen.getByText(/no tiene combates estructurados/i)).toBeTruthy());
        expect(api.get).toHaveBeenCalledWith('/fights/event/1');
    });

    it('lista los combates con resultado, fuente y nivel de confianza', async () => {
        await mountAndPickEvent(2);

        await waitFor(() => expect(screen.getByText(/Ganador: Ander Sánchez/)).toBeTruthy());
        expect(screen.getByText(/R2 2:04/)).toBeTruthy();
        expect(screen.getByText(/Fuente: wowmma.com \(C2\)/)).toBeTruthy();
        expect(screen.getByText('(externo)')).toBeTruthy();
    });

    it('envía el payload correcto al crear (mm:ss → segundos) y muestra el aviso de éxito', async () => {
        api.post.mockResolvedValueOnce({ data: { fight_id: 9 } });
        await mountAndPickEvent(2);
        fireEvent.click(await screen.findByRole('button', { name: /Añadir combate/ }));

        fireEvent.change(document.querySelector('select[name="red_fighter_id"]'), { target: { value: '2' } });
        fireEvent.change(document.querySelector('select[name="blue_mode"]'), { target: { value: 'external' } });
        fireEvent.change(document.querySelector('input[name="blue_external_name"]'), { target: { value: 'Rival Prueba' } });

        fireEvent.change(document.querySelector('select[name="status"]'), { target: { value: 'COMPLETED' } });
        fireEvent.change(document.querySelector('select[name="result"]'), { target: { value: 'BLUE' } });
        fireEvent.change(document.querySelector('select[name="method_code"]'), { target: { value: 'KO' } });
        fireEvent.change(document.querySelector('input[name="ending_round"]'), { target: { value: '1' } });
        fireEvent.change(document.querySelector('input[name="round_time"]'), { target: { value: '0:30' } });

        fireEvent.submit(document.querySelector('form'));

        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
        const [url, body] = api.post.mock.calls[0];
        expect(url).toBe('/fights/event/2');
        expect(body.nature).toBe('PROFESSIONAL');
        expect(body.status).toBe('COMPLETED');
        expect(body.result_type).toBe('PARTICIPANT_WIN');
        expect(body.winner_corner).toBe('BLUE');
        expect(body.method_code).toBe('KO');
        expect(body.ending_round).toBe(1);
        expect(body.round_seconds).toBe(30);
        expect(body.participants).toEqual([
            { corner: 'RED', fighter_id: 2 },
            { corner: 'BLUE', external_name: 'Rival Prueba' },
        ]);
        await screen.findByRole('status');
    });

    it('pinta los errores del backend (400 con array) en la bandeja de alerta', async () => {
        api.post.mockRejectedValueOnce({
            response: {
                status: 400,
                data: { status: 'error', errors: ['un COMPLETED requiere source_name (procedencia mínima)'] },
            },
        });
        await mountAndPickEvent(2);
        fireEvent.click(await screen.findByRole('button', { name: /Añadir combate/ }));
        fireEvent.change(document.querySelector('select[name="red_fighter_id"]'), { target: { value: '2' } });
        fireEvent.change(document.querySelector('select[name="blue_mode"]'), { target: { value: 'external' } });
        fireEvent.change(document.querySelector('input[name="blue_external_name"]'), { target: { value: 'Rival Prueba' } });
        fireEvent.change(document.querySelector('select[name="status"]'), { target: { value: 'COMPLETED' } });
        fireEvent.change(document.querySelector('select[name="result"]'), { target: { value: 'DRAW' } });
        fireEvent.change(document.querySelector('select[name="method_code"]'), { target: { value: 'KO' } });
        fireEvent.submit(document.querySelector('form'));

        // validación cliente: empate con método → error local
        await waitFor(() => expect(screen.getByText(/no admite método de victoria/i)).toBeTruthy());

        // invalidamos el método para que el envío sea válido en cliente: el 400 del backend se pinta
        fireEvent.change(document.querySelector('select[name="method_code"]'), { target: { value: '' } });
        fireEvent.submit(document.querySelector('form'));

        await waitFor(() => expect(screen.getByText(/procedencia mínima/i)).toBeTruthy());
    });

    it('confirma mensaje amigable cuando el slot está duplicado (409)', async () => {
        api.post.mockRejectedValueOnce({ response: { status: 409 } });
        await mountAndPickEvent(2);
        fireEvent.click(await screen.findByRole('button', { name: /Añadir combate/ }));
        fireEvent.change(document.querySelector('select[name="red_fighter_id"]'), { target: { value: '2' } });
        fireEvent.change(document.querySelector('select[name="blue_mode"]'), { target: { value: 'external' } });
        fireEvent.change(document.querySelector('input[name="blue_external_name"]'), { target: { value: 'Rival Prueba' } });
        fireEvent.submit(document.querySelector('form'));

        await waitFor(() => expect(screen.getByText(/bout_order/i)).toBeTruthy());
    });

    it('parsea tiempo m:ss a segundos en el payload de edición', async () => {
        api.put.mockResolvedValueOnce({ data: {} });
        await mountAndPickEvent(2);
        fireEvent.click(await screen.findByRole('button', { name: /Editar resultado/ }));

        // editar a DEC con 2:45 (decisión: asalto/tiempo opcionales)
        fireEvent.change(document.querySelector('select[name="method_code"]'), { target: { value: 'DEC_UNANIMOUS' } });
        fireEvent.change(document.querySelector('input[name="round_time"]'), { target: { value: '2:45' } });
        fireEvent.submit(document.querySelector('form'));

        await waitFor(() => expect(api.put).toHaveBeenCalledTimes(1));
        const [url, body] = api.put.mock.calls[0];
        expect(url).toBe('/fights/id/5');
        expect(body.round_seconds).toBe(165);
        expect(body.result_type).toBe('PARTICIPANT_WIN');
        expect(body.winner_corner).toBe('RED');
    });
});
