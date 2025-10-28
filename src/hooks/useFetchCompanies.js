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

    const fetchCompanies = async (page = pagination.current_page, limit = pagination.limit) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/companies?page=${page}&limit=${limit}`);
            
            setCompanies(response.data.companies);
            setPagination(response.data.pagination);

        } catch (err) {
            console.error("Error al obtener las compañías: ", err);
            setError("No se pudieron cargar los datos de las compañías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pagination.total_pages) {
            fetchCompanies(pageNumber, pagination.limit);
        }
    };

    return { 
        companies, 
        pagination, 
        loading, 
        error, 
        goToPage
    };
};

export default useFetchCompanies;