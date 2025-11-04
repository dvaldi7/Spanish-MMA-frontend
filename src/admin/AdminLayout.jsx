import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
    
   
    const [isMenuOpen, setIsMenuOpen] = React.useState(false); 

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
        <div className="min-h-screen bg-gray-100 md:flex"> 
            
            {/* Botón de Menú para Móviles */}
            <div className="md:hidden p-4 bg-white shadow-md flex justify-between items-center sticky top-0 z-1">
                <h3 className="text-lg font-bold text-gray-800">Admin Panel</h3>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md hover:bg-gray-200"
                >
                    {isMenuOpen ? 'X' : '☰'} 
                </button>
            </div>

            {/* Sidebar de Administración */}
            <aside 
                className={`
                    fixed inset-y-0 left-0 z-20 w-40 bg-white p-4 shadow-xl 
                    transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:relative md:translate-x-0 md:block
                `}
            >
                {/* Contenido del Sidebar */}
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                    Admin Menú
                </h3>
                <nav>
                    {adminLinks.map(link => (
                        <NavLink 
                            key={link.to} 
                            to={link.to} 
                            className={navLinkClass}
                            onClick={() => setIsMenuOpen(false)} 
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                <Outlet /> 
            </main>

            {/* para cerrar el menú en móvil */}
            {isMenuOpen && (
                <div 
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 sm:hidden"
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;