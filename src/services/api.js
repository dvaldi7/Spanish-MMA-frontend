import axios from 'axios';

const baseURL = import.meta.env.PROD
    ? 'https://spanish-mma-backend.onrender.com/api'
    : 'http://localhost:3001/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            console.error('Sesión expirada o no autorizada. Forzando cierre de sesión.');
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);


export default api;