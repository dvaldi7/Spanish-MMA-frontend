import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
    
    const adminLinks = [
        { to: '/admin/fighters', label: 'Peleadores' },
        { to: '/admin/companies', label: 'Compañías' },
        { to: '/admin/events', label: 'Eventos' },
    ];

    const navLinkClass = ({ isActive }) => 
        `px-4 py-2 my-1 rounded-lg transition duration-150 block font-medium ${
            isActive 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-200'
        }`;

    return (
        <div className="flex min-h-screen bg-gray-100"> 
            
            {/* Sidebar de Administración */}
            <aside className="w-40 bg-white p-4 shadow-xl">
                
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                    Admin Menu
                    </h3>
                <nav>
                    {adminLinks.map(link => (
                        <NavLink key={link.to} to={link.to} className={navLinkClass}>
                            {link.icon} {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Contenido Principal*/}
            <main className="flex-1 p-6">
                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout;