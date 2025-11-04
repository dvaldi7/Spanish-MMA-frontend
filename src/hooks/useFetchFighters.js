import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

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
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');

    const fetchFighters = useCallback(async (page = pagination.current_page, limit = pagination.limit, term = '') => {
        setLoading(true);
        setError(null);

        let url = `/fighters?page=${page}&limit=${limit}`;

        if (term) {
            url += `&search=${term}`;
        }

        try {

            const response = await api.get(url);

            setFighters(response.data.fighters);
            setPagination(response.data.pagination);

        } catch (error) {
            console.error("Error al obtener luchadores:", error);
            setError("No se pudieron cargar los datos de luchadores. Inténtalo de nuevo más tarde");

        } finally {
            setLoading(false);
        }
    }, [ setFighters, setPagination, setLoading, setError ]);

    useEffect(() => {
        fetchFighters(1, pagination.limit, currentSearchTerm);
    }, [currentSearchTerm, pagination.limit, fetchFighters]);

   const goToPage = (pageNumber) => { 
    if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
        fetchFighters(pageNumber, pagination.limit, currentSearchTerm); 
    }
};

    return {
        fighters,
        pagination,
        loading,
        error,
        fetchFighters,
        goToPage,
        searchTerm: currentSearchTerm,
    };
};

export default useFetchFighters;