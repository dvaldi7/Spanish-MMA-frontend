import { useState, useEffect } from 'react';
import api from '../services/api';

const useAuth = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('jwtToken');
            const role = localStorage.getItem('userRole');

            if (token && role) {
                try {
                    await api.get('/fighters/auth/verify'); 
                    setUser({ role });
                } catch (error) {
                    console.error("Token no válido al arrancar");
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            const { token, role } = response.data; 

            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userRole', role);

            setUser({ role }); 

            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor.';
            console.error('Login failed:', errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    return {
        user,
        login,
        logout,
        loading,
     };
};


export default useAuth;