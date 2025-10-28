import { useState } from 'react';
import api from '../services/api';

const useAuth = () => {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('jwtToken');
        const role = localStorage.getItem('userRole');
  
        return token && role ? { role } : null; 
    });

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

    return { user, login, logout };
};


export default useAuth;