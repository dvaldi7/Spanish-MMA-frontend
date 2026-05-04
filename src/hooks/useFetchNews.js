import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useFetchNews = (initialLimit = 5) => {
    const [news, setNews] = useState([]);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        limit: initialLimit
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNews = useCallback(async (page = 1, limit = 5, term = '') => {
        setLoading(true);
        setError(null);
        try {
            let url = `/news?page=${page}&limit=${limit}`;
            if (term) url += `&search=${term}`;

            const response = await api.get(url);

            if (response.data.news) {
                setNews(response.data.news);
                setPagination(response.data.pagination);
            } else {
                setNews(response.data);
            }
        } catch (error) {
            console.error("Error al obtener noticias:", error);
            setError("Error al cargar las noticias.");
        } finally {
            setLoading(false);
        }
    }, [initialLimit]); 

    useEffect(() => {
        fetchNews(1, initialLimit, '');
    }, [fetchNews, initialLimit]);

    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
            fetchNews(pageNumber, pagination.limit, '');
        }
    };

    return {
        news,
        pagination,
        loading,
        error,
        fetchNews,
        goToPage,
    };
};

export default useFetchNews;