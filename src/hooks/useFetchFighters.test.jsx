import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useFetchFighters from './useFetchFighters';

const apiGet = vi.fn();

vi.mock('../services/api', () => ({
    default: { get: (...args) => apiGet(...args) },
}));

const apiResponse = (fighters, pagination) => ({
    data: { status: 'success', results: fighters.length, fighters, pagination },
});

const defaultPagination = {
    total_items: 2,
    total_pages: 5,
    current_page: 1,
    limit: 10,
};

beforeEach(() => {
    apiGet.mockReset();
});

describe('useFetchFighters', () => {
    it('carga el listado al montar con page=1 y limit inicial', async () => {
        apiGet.mockResolvedValueOnce(apiResponse([], defaultPagination));

        const { result } = renderHook(() => useFetchFighters(10));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(apiGet).toHaveBeenCalledTimes(1);
        const [url, config] = apiGet.mock.calls[0];
        expect(url).toBe('/fighters');
        expect(config.params).toEqual({ page: 1, limit: 10 });
        expect(config.signal).toBeInstanceOf(AbortSignal);
        expect(result.current.error).toBeNull();
    });

    it('goToPage conserva el término de búsqueda', async () => {
        apiGet.mockResolvedValue(apiResponse([], defaultPagination));

        const { result } = renderHook(() => useFetchFighters(10));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            result.current.goToPage(3, 'Juan Pérez');
        });

        const [, config] = apiGet.mock.calls[1];
        expect(config.params).toEqual({ page: 3, limit: 10, search: 'Juan Pérez' });
    });

    it('el término viaja en params (axios lo codifica) incluso con caracteres especiales', async () => {
        apiGet.mockResolvedValue(apiResponse([], defaultPagination));

        const { result } = renderHook(() => useFetchFighters(10));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.fetchFighters(1, 10, 'Juan & Mía=50%');
        });

        const [, config] = apiGet.mock.calls[1];
        expect(config.params.search).toBe('Juan & Mía=50%');
        expect(config.signal).toBeInstanceOf(AbortSignal);
    });

    it('cancela la petición anterior cuando llega una nueva', async () => {
        //El mount queda pendiente para siempre; la segunda petición resuelve
        apiGet.mockImplementationOnce(() => new Promise(() => {}));

        const { result } = renderHook(() => useFetchFighters(10));

        const firstSignal = apiGet.mock.calls[0][1].signal;
        expect(firstSignal.aborted).toBe(false);

        let resolveSecond;
        apiGet.mockImplementationOnce(
            () => new Promise((resolve) => { resolveSecond = resolve; })
        );

        await act(async () => {
            const pending = result.current.fetchFighters(1, 10, 'nueva');
            resolveSecond(apiResponse([], defaultPagination));
            await pending;
        });

        expect(firstSignal.aborted).toBe(true);
        expect(result.current.loading).toBe(false);
    });

    it('expone un error con mensaje accionable si la petición falla', async () => {
        apiGet.mockRejectedValueOnce(new Error('fallo de red'));

        const { result } = renderHook(() => useFetchFighters(10));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error.message).toBe(
            'No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde'
        );
    });

    it('ignora los errores de petición cancelada', async () => {
        apiGet.mockRejectedValueOnce(Object.assign(new Error('cancelada'), { code: 'ERR_CANCELED' }));

        const { result } = renderHook(() => useFetchFighters(10));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeNull();
    });
});
