import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { user, login } = useAuth();

    const passwordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (user) {
        navigate('/admin/fighters', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!email || !password) {
            setError('Por favor, ingresa email y contraseña');
            return;
        }

        try {
            await login(email, password);
            setMessage('¡Login exitoso! Token guardado.');
            
            navigate('/admin');

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Acceso de Administrador</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500
                         focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 pr-10 border border-gray-300 rounded-md
                             focus:ring-blue-500 focus:border-blue-500"
                            required
                        />

                        <button
                            type="button"
                            onClick={passwordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5
                             text-gray-600"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >

                           {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-md
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2"
                >
                    Iniciar Sesión
                </button>
            </form>

            {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
            {message && <p className="mt-4 text-sm text-green-600 text-center">{message}</p>}
        </div>
    );
};

export default Login;