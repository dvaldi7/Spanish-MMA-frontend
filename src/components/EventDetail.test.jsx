import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventDetail from './EventDetail';

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../services/api', () => ({ default: api }));
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('./FadeImage', () => ({ default: (props) => <img alt={props.alt ?? 'fade'} /> }));

const event = {
    event_id: 19,
    name: 'WOW 33: Vitoria',
    slug: 'wow-33-vitoria',
    date: '2026-10-24',
    is_completed: 1,
    location: 'Buesa Arena, Vitoria-Gasteiz',
    description: 'CarteleraLegacyUno * VS CarteleraLegacyDos #',
};

const fightInternal = (over = {}) => ({
    fight_id: 10,
    event_id: 19,
    bout_order: 1,
    nature: 'PROFESSIONAL',
    status: 'COMPLETED',
    result_type: 'PARTICIPANT_WIN',
    winner_participant_id: 101,
    method_code: 'DEC_UNANIMOUS',
    method_detail: null,
    ending_round: null,
    round_seconds: null,
    scheduled_rounds: 3,
    weight_class: 'Bantamweight',
    is_title: 1,
    replaces_fight_id: null,
    source_name: 'wowmma.com',
    source_url: 'https://www.wowmma.com/wow-events/wow-33-vitoria',
    fetched_at: '2026-10-30T14:20:00.000Z',
    capture_method: 'official_site',
    confidence: 'C2',
    field_flag: 'known',
    updated_at: '2026-10-30T14:30:00.000Z',
    participants: [
        { participant_id: 101, corner: 'RED', fighter_id: 46, external_name: null, announced_name: null, fighter: { fighter_id: 46, first_name: 'Ander', last_name: 'Sánchez', nickname: null, slug: 'ander-sanchez', photo_url: null } },
        { participant_id: 102, corner: 'BLUE', fighter_id: 22, external_name: null, announced_name: null, fighter: { fighter_id: 22, first_name: 'Borja', last_name: 'García', nickname: null, slug: 'borja-garcia', photo_url: null } },
    ],
    ...over,
});

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/eventos/wow-33-vitoria']}>
            <EventDetail />
        </MemoryRouter>
    );

beforeEach(() => {
    api.get.mockReset();
    api.get.mockImplementation((url) => {
        if (url.startsWith('/events/slug/')) return Promise.resolve({ data: { event } });
        if (url.startsWith('/events/id/19/fighters')) return Promise.resolve({ data: { roster: [] } });
        return Promise.resolve({ data: { results: 0, fights: [] } });
    });
});

describe('EventDetail — cartelera estructurada (TASK-0049)', () => {
    it('muestra los combates estructurados cuando el evento los tiene', async () => {
        const pending = fightInternal({
            fight_id: 12,
            bout_order: 3,
            result_type: 'UNKNOWN',
            winner_participant_id: null,
            field_flag: 'needs_review',
            method_code: 'SUBMISSION',
            ending_round: 3,
            round_seconds: 89,
            participants: [
                { participant_id: 201, corner: 'RED', fighter_id: 34, external_name: null, announced_name: null, fighter: { fighter_id: 34, first_name: 'Daniel', last_name: 'Richardson', nickname: null, slug: 'daniel-richardson', photo_url: null } },
                { participant_id: 202, corner: 'BLUE', fighter_id: null, external_name: 'Junior Quirama', announced_name: null, fighter: null },
            ],
        });
        api.get.mockImplementation((url) => {
            if (url.startsWith('/events/slug/')) return Promise.resolve({ data: { event } });
            if (url.startsWith('/events/id/19/fighters')) return Promise.resolve({ data: { roster: [] } });
            if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 2, fights: [fightInternal(), pending] } });
            return Promise.reject(new Error('url ' + url));
        });

        renderPage();

        expect(await screen.findByText('Ander Sánchez')).toBeTruthy();
        expect(screen.getByText('Borja García')).toBeTruthy();
        expect(screen.getByText(/Decisión unánime/)).toBeTruthy();
        expect(screen.getAllByText('Profesional').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Fuente: wowmma\.com/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Confianza C2/).length).toBeGreaterThanOrEqual(1);

        // ganador confirmado resaltado, pendiente NO resaltado
        expect(screen.getAllByText('GANADOR 🏆').length).toBe(1);
        expect(screen.getByText(/Resultado pendiente de revisión/)).toBeTruthy();
        expect(screen.getByText(/Sumisión/)).toBeTruthy();
        expect(screen.getByText(/1:29/)).toBeTruthy();

        // sin cartebera duplicada: el texto legacy NO aparece
        expect(screen.queryByText(/CarteleraLegacyUno/)).toBeNull();
    });

    it('marca (rival externo) sin enlace y enlaza a la ficha del interno', async () => {
        const withExternal = fightInternal({
            participants: [
                fightInternal().participants[0],
                { participant_id: 102, corner: 'BLUE', fighter_id: null, external_name: 'Rival Externo', announced_name: null, fighter: null },
            ],
        });
        api.get.mockImplementation((url) => {
            if (url.startsWith('/events/slug/')) return Promise.resolve({ data: { event } });
            if (url.startsWith('/events/id/19/fighters')) return Promise.resolve({ data: { roster: [] } });
            if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 1, fights: [withExternal] } });
            return Promise.reject(new Error('url ' + url));
        });
        renderPage();
        const link = await screen.findByRole('link', { name: /Ander Sánchez/ });
        expect(link.getAttribute('href')).toBe('/peleadores/ander-sanchez');
        await waitFor(() => expect(screen.getAllByText(/rival externo/).length).toBeGreaterThan(0));
    });

    it('mantiene la cartelera legacy cuando el evento no tiene combates estructurados', async () => {
        renderPage();

        expect(await screen.findByText('CarteleraLegacyUno')).toBeTruthy();
        expect(screen.getAllByText('VICTORIA 🏆').length).toBeGreaterThan(0);
        expect(screen.getAllByText('DERROTA ✘').length).toBeGreaterThan(0);
        expect(screen.queryByText('GANADOR 🏆')).toBeNull();
        expect(screen.queryByText(/Fuente: wowmma\.com/)).toBeNull();
    });

    it('no muestra ganador resaltado si el dato está en revisión aunque tuviera winner', async () => {
        const inReview = fightInternal({
            fight_id: 11,
            bout_order: 2,
            field_flag: 'needs_review',
        });
        api.get.mockImplementation((url) => {
            if (url.startsWith('/events/slug/')) return Promise.resolve({ data: { event } });
            if (url.startsWith('/events/id/19/fighters')) return Promise.resolve({ data: { roster: [] } });
            if (url.startsWith('/fights/event/')) return Promise.resolve({ data: { results: 1, fights: [inReview] } });
            return Promise.reject(new Error('url ' + url));
        });

        renderPage();

        expect(await screen.findByText(/Ganador pendiente de revisión/)).toBeTruthy();
        expect(screen.queryByText('GANADOR 🏆')).toBeNull();
    });
});
