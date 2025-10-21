import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import octagonoImage from '/octagono.png';

export const Header = () => {

    const { user, logout } = useAuth();

    return (
        <>
            <header id='header' className='h-24 w-auto bg-custom-red text-white font-sans flex flex-wrap'>

                <div className='container mx-auto flex
                md:flex-row
                sm:flex-col'>

                    <div id='logo' className='flex-1 sm:mx-auto'>
                        <Link to='/'>
                            <div className='w-64 mt-1.5 pt-0.5 pb-0.5 bg-custom-gold text-custom-black text-center rounded-md
                            hover:bg-gray-400 hover:text-custom-red tracking-wider cursor-pointer overflow-hidden transition duration-300
                            flex flex-row group'>

                                <span className='block float-left ml-11 mt-5 animation group-hover:scale-125
                                group-hover:animate-from-bellow'>
                                    <img src={octagonoImage} alt='octogono' className='h-5 w-5' />
                                </span>

                                <h3 className='block text-3xl mt-1.5 ml-7 float-right mr-16 transition duration-100
                                group-hover:animate-from-right'>
                                    Sp<span className='group-hover:text-custom-gold'>ani</span>sh
                                    M<span className='group-hover:text-custom-gold'>M</span>A
                                </h3>
                            </div>
                        </Link>

                    </div>

                    <nav className='flex-1 '>
                        <ul className='flex flex-row text-white h-20 items-center text-xl
                        text-center sm:mr-0 sm:text-center md:justify-end space-x-4'>

                            <li className='menu-item'>
                                <Link to='/' className='menu-item-a hover:text-custom-gold transition duration-200'>Inicio</Link>
                            </li>

                            <li className='menu-item'>
                                <Link to='/peleadores' className='menu-item-a hover:text-custom-gold transition duration-200'>Peleadores</Link>
                            </li>

                            <li className='menu-item'>
                                <Link to='/promotoras' className='menu-item-a hover:text-custom-gold transition duration-200'>Promotoras</Link>
                            </li>

                            <li className='menu-item'>
                                <Link to='/eventos' className='menu-item-a hover:text-custom-gold transition duration-200'>Eventos</Link>
                            </li>

                            {/* AUTENTICACIÓN */}
                            <li className='menu-item ml-4'>
                                {user ? (
                                    <div className='flex items-center space-x-3'>
                                        {/* Enlace al Dashboard de Admin */}
                                        <Link to="/admin/dashboard" className="text-sm bg-custom-gold text-custom-black px-3 py-1 rounded-full hover:bg-gray-400 transition">
                                            Admin
                                        </Link>
                                        {/* Botón de Logout */}
                                        <button
                                            onClick={logout}
                                            className="text-sm text-custom-black hover:text-white transition"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/login" className="text-sm bg-custom-gold text-custom-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200">
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