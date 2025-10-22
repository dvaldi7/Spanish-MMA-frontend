import React from 'react';
import Header from './Header'; 
import { Outlet } from 'react-router-dom'; 

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <Header />

            {/* MAIN */}
            <main className="flex-grow container mx-auto p-4">
                <Outlet /> 
            </main>

            {/* FOOTER */}
            <footer className="bg-custom-black text-custom-gold text-center p-4 mt-8">
                <p>&copy; {new Date().getFullYear()} Spanish MMA | Desarrollado por Davaldev</p>
            </footer>
        </div>
    );
};

export default Layout;