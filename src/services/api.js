import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
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
    (error) => {
        return Promise.reject(error);
    }
);

//Interceptor para cuando me caduque el token o expire
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        const status = error.response ? error.response.status : null;

        // token inválido o expirado.
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