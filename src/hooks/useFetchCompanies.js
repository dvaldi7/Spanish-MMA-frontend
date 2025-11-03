import { useState, useEffect } from 'react';
import api from '../services/api';

const useFetchCompanies = (initialLimit = 10) => {

    const [companies, setCompanies] = useState([]);

    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        limit: initialLimit
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompanies = async (page = pagination.current_page, limit = pagination.limit, term = '' ) => {
        setLoading(true);
        setError(null);

        let url = `/companies?page=${page}&limit=${limit}`;

        if (term) {
            url += `&search=${term}`;
        }

        try {
            
            const response = await api.get(url);
            
            setCompanies(response.data.companies);
            setPagination(response.data.pagination);

        } catch (error) {
            console.error("Error al obtener las compañías: ", error);
            setError("No se pudieron cargar los datos de las compañías");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies(1, initialLimit, '');
    }, []);

    const goToPage = (pageNumber, currentSearchTerm = '') => {
        if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
            fetchCompanies(pageNumber, pagination.limit, currentSearchTerm);
        }
    };

    return { 
        companies, 
        pagination, 
        loading, 
        error, 
        goToPage,
        fetchCompanies,
    };
};

export default useFetchCompanies;