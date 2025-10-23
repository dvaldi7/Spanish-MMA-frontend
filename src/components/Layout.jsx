import React from 'react';
import Header from './Header'; 
import { Outlet } from 'react-router-dom'; 

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-bg-octagon bg-cover bg-center bg-no-repeat bg-fixed">
            {/* HEADER */}
            <Header />

            {/* MAIN */}
            <main className="flex-grow container mx-auto p-4 font-serif">
                <Outlet /> 
            </main>

            {/* FOOTER */}
            <footer className="bg-custom-black text-custom-gold text-center p-4 mt-8 font-mono">
                <p>&copy; {new Date().getFullYear()} Spanish MMA | Desarrollado por Davaldev</p>
            </footer>
        </div>
    );
};

export default Layout;