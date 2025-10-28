import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import octagonoImage from '/octagono.png';
import { FiMenu, FiX } from 'react-icons/fi'; 

export const Header = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <header id='header' className='bg-custom-red text-white font-sans'>

                <div className='container mx-auto p-5 flex justify-between items-center'> 

                    <div id='logo w-20'>
                        <Link to='/'>
                            <div className='w-36 bg-custom-gold text-custom-black text-center rounded-md
                            hover:bg-gray-400 hover:text-custom-red tracking-wider cursor-pointer overflow-hidden
                             transition duration-300 flex items-center group p-1'> 

                                <span className='mx-2'>
                                    <img src={octagonoImage} alt='octogono' className='w-9 h-8 
                                    group-hover:animate-from-bellow' />
                                </span>

                                <h3 className='text-xl font-semibold transition duration-300 
                                group-hover:animate-from-right'>
                                    Sp<span className='group-hover:text-custom-gold'>ani</span>sh
                                    M<span className='group-hover:text-custom-gold'>M</span>A
                                </h3>
                            </div>
                        </Link>
                    </div>

                    <button 
                        onClick={toggleMenu} 
                        className='md:hidden text-white text-3xl hover:text-custom-gold'
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                    
                    <nav className={`absolute md:relative w-full md:w-auto left-0 top-24 md:top-auto
                     bg-custom-red md:bg-transparent shadow-md md:shadow-none z-10
                                     ${isMenuOpen ? 'flex' : 'hidden md:flex'}`}>
                        
                        <ul className='flex flex-1 flex-col md:flex-row text-white w-full md:w-auto md:items-center 
                        text-xl p-4 md:p-0 md:justify-center'>

                            <li className='menu-item w-full md:w-auto'>
                                <Link to='/' onClick={toggleMenu} className='menu-item-a
                                 hover:text-custom-gold transition duration-200 block p-2 md:p-0'>Inicio</Link>
                            </li>
                            <li className='menu-item w-full md:w-auto'>
                                <Link to='/peleadores' onClick={toggleMenu} className='menu-item-a
                                 hover:text-custom-gold transition duration-200 block p-2 md:p-0'>Peleadores</Link>
                            </li>
                            <li className='menu-item w-full md:w-auto'>
                                <Link to='/promotoras' onClick={toggleMenu} className='menu-item-a
                                 hover:text-custom-gold transition duration-200 block p-2 md:p-0'>Compañías</Link>
                            </li>
                            <li className='menu-item w-full md:w-auto'>
                                <Link to='/eventos' onClick={toggleMenu} className='menu-item-a
                                 hover:text-custom-gold transition duration-200 block p-2 md:p-0 
                                 border-b border-black border-'>Eventos</Link>
                            </li>

                            {/* AUTENTICACIÓN */}
                            <li className='menu-item w-full md:w-auto pt-2 md:pt-0 md:border-t-0
                             border-gray-700'>
                                {user ? (
                                    <div className='flex items-center space-x-3'>
                                        {/* Enlace al Dashboard de Admin */}
                                        <Link to="/admin/dashboard" onClick={toggleMenu} className="text-sm
                                         bg-custom-gold text-custom-black px-3 py-1 rounded-full
                                          hover:bg-gray-400 transition">
                                            🛡️ Admin
                                        </Link>
                                        {/* Botón de Logout */}
                                        <button
                                            onClick={() => { logout(); toggleMenu(); }}
                                            className="text-sm text-gray-400 hover:text-white transition"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={toggleMenu} className="text-sm bg-custom-gold
                                     text-custom-black px-4 py-2 rounded-md hover:bg-gray-400 transition 
                                     duration-200 block w-full text-center mr-7">
                                        Login
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </nav>

                </div>
            </header>
        </>
    )
}

export default Header;