import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth(); 

    if (loading) {
        return <p className="text-center mt-20">Verificando acceso...</p>; 
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />; 
    }


    return children;
};

export default ProtectedRoute;