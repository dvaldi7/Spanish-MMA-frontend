import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminFighters from './AdminFighters';

const hookState = {
    fighters: [],
    pagination: { total_items: 0, total_pages: 0, current_page: 1, limit: 10 },
    loading: false,
    error: null,
    goToPage: vi.fn(),
    fetchFighters: vi.fn(),
};

vi.mock('../hooks/useFetchFighters', () => ({
    default: () => hookState,
}));

vi.mock('../services/api', () => ({
    default: { delete: vi.fn(), get: vi.fn() },
}));

vi.mock('../components/FighterFormModal', () => ({
    default: () => <div data-testid="fighter-form-modal" />,
}));

const renderAdmin = () =>
    render(
        <MemoryRouter>
            <AdminFighters />
        </MemoryRouter>
    );

beforeEach(() => {
    hookState.fighters = [];
    hookState.pagination = { total_items: 0, total_pages: 0, current_page: 1, limit: 10 };
    hookState.loading = false;
    hookState.error = null;
    hookState.goToPage.mockReset();
    hookState.fetchFighters.mockReset();
});

describe('AdminFighters', () => {
    it('no dispara peticiones extra al montar (el hook ya carga el listado)', () => {
        renderAdmin();

        expect(hookState.fetchFighters).not.toHaveBeenCalled();
    });

    it('muestra estado vacío cuando no hay peleadores', () => {
        renderAdmin();

        expect(screen.getAllByText('Aún no hay peleadores registrados').length).toBeGreaterThan(0);
    });

    it('muestra el mensaje de error del hook completo', () => {
        hookState.error = new Error('No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde');

        renderAdmin();

        expect(
            screen.getByText(/Error al cargar: No se pudieron cargar los datos de luchadores/)
        ).toBeInTheDocument();

        hookState.error = null;
    });
});
