import { useState, useEffect } from 'react';
import api from '../services/api';

const useFetchEvents = (initialLimit = 10) => {

    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        limit: initialLimit
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvents = async (page = pagination.current_page, limit = pagination.limit) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/events?page=${page}&limit=${limit}`);
            
            setEvents(response.data.events);
            setPagination(response.data.pagination);

        } catch (err) {
            console.error("Error al obtener los eventos: ", err);
            setError("No se pudieron cargar los datos de los eventos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
            fetchEvents(pageNumber, pagination.limit);
        }
    };

    return { 
        events, 
        pagination, 
        loading, 
        error, 
        goToPage
    };
};

export default useFetchEvents;