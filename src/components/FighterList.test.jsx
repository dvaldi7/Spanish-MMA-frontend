import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FighterList from './FighterList';

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

vi.mock('react-helmet-async', () => ({
    Helmet: () => null,
}));

const renderList = () =>
    render(
        <MemoryRouter>
            <FighterList />
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

describe('FighterList', () => {
    it('muestra mensaje de listado vacío sin búsqueda', () => {
        renderList();

        expect(screen.getByText('Aún no hay luchadores registrados')).toBeInTheDocument();
        expect(screen.queryByText('Limpiar búsqueda')).not.toBeInTheDocument();
    });

    it('muestra contador real y tarjetas cuando hay resultados', () => {
        hookState.fighters = [
            { fighter_id: 1, first_name: 'Ilia', last_name: 'Topuria', slug: 'ilia-topuria', record_wins: 14, record_losses: 0, record_draws: 0 },
            { fighter_id: 2, first_name: 'Ana', last_name: 'Prueba', slug: 'ana-prueba', record_wins: 5, record_losses: 2, record_draws: 0 },
        ];
        hookState.pagination = { total_items: 27, total_pages: 3, current_page: 1, limit: 10 };

        renderList();

        expect(screen.getByText(/27 luchadores encontrados/)).toBeInTheDocument();
        expect(screen.getByText(/Ilia/)).toBeInTheDocument();
        expect(screen.queryByText(/No se encontraron luchadores/)).not.toBeInTheDocument();
    });

    it('muestra estado vacío con botón limpiar al buscar sin resultados', async () => {
        hookState.pagination = { total_items: 0, total_pages: 0, current_page: 1, limit: 10 };

        renderList();

        fireEvent.change(screen.getByPlaceholderText('Buscar peleador'), {
            target: { value: 'zzz-imposible' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

        expect(await screen.findByText('No se encontraron luchadores')).toBeInTheDocument();
        expect(screen.getByText(/No hay resultados para «zzz-imposible»/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

        expect(hookState.fetchFighters).toHaveBeenCalledWith(1, 10, 'zzz-imposible');
        expect(hookState.fetchFighters).toHaveBeenLastCalledWith(1, 10, '');
    });

    it('la búsqueda se envía al formulario y la paginación conserva el término', () => {
        hookState.pagination = { total_items: 27, total_pages: 3, current_page: 1, limit: 10 };
        hookState.fighters = [
            { fighter_id: 1, first_name: 'Ilia', last_name: 'Topuria', slug: 'ilia-topuria', record_wins: 14, record_losses: 0, record_draws: 0 },
        ];

        renderList();

        fireEvent.change(screen.getByPlaceholderText('Buscar peleador'), { target: { value: 'Topuria' } });
        fireEvent.submit(screen.getByPlaceholderText('Buscar peleador').closest('form'));
        expect(hookState.fetchFighters).toHaveBeenCalledWith(1, 10, 'Topuria');

        fireEvent.click(screen.getByRole('button', { name: '3' }));
        expect(hookState.goToPage).toHaveBeenCalledWith(3, 'Topuria');
    });

    it('renderiza ventana de paginación con elipsis en lugar de un botón por página', () => {
        hookState.pagination = { total_items: 200, total_pages: 20, current_page: 10, limit: 10 };
        hookState.fighters = [
            { fighter_id: 1, first_name: 'Ilia', last_name: 'Topuria', slug: 'ilia-topuria', record_wins: 14, record_losses: 0, record_draws: 0 },
        ];

        renderList();

        const pageButtons = ['1', '8', '9', '10', '11', '12', '20'];
        pageButtons.forEach((page) => {
            expect(screen.getByRole('button', { name: page })).toBeInTheDocument();
        });
        expect(screen.getAllByText('…').length).toBe(2);
        expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    });

    it('muestra el mensaje de error del hook', () => {
        hookState.error = new Error('No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde');

        renderList();

        expect(
            screen.getByText('No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde')
        ).toBeInTheDocument();

        hookState.error = null;
    });
});
