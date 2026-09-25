import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const isAbortError = (error) =>
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError';

const useFetchFighters = (initialLimit = 10) => {

    const [fighters, setFighters] = useState([]);

    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        limit: initialLimit
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    const fetchFighters = useCallback(async (page = 1, limit = 10, term = '') => {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            //El término viaja en params: axios lo codifica correctamente
            const response = await api.get('/fighters', {
                params: { page, limit, ...(term ? { search: term } : {}) },
                signal: controller.signal,
            });

            if (abortRef.current !== controller) return;

            setFighters(response.data.fighters);
            setPagination(response.data.pagination);

        } catch (err) {
            if (isAbortError(err) || abortRef.current !== controller) return;
            console.error("Error al obtener luchadores:", err);
            setError(new Error('No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde'));

        } finally {
            if (abortRef.current === controller) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchFighters(1, initialLimit, '');
    }, [initialLimit, fetchFighters]);

    //El término se conserva al paginar o refrescar tras guardar/eliminar
    const goToPage = (pageNumber, term = '') => {
        if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
            fetchFighters(pageNumber, pagination.limit, term);
        }
    };

    return {
        fighters,
        pagination,
        loading,
        error,
        fetchFighters,
        goToPage,
    };
};

export default useFetchFighters;
