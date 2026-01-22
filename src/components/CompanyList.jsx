import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchCompanies from '../hooks/useFetchCompanies';
import avatar from "/images/companies/avatar.jpg";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const CompanyList = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const {
        companies,
        pagination,
        loading,
        error,
        goToPage,
        fetchCompanies,
    } = useFetchCompanies(10);

    const handleSearch = (e) => {
        e.preventDefault();

        fetchCompanies(1, pagination.limit, searchTerm);
    }

    if (loading) return <p className="text-center text-xl p-6 text-white">Cargando compañías...</p>;
    if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;

    const { current_page, total_pages, total_items } = pagination;

    const pageButtons = [];
    for (let i = 1; i <= total_pages; i++) {
        pageButtons.push(
            <button
                key={i}
                onClick={() => goToPage(i)}
                className={`px-4 py-2 mx-1 rounded-full transition duration-150 text-sm ${i === current_page
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-200'
                    }`}
            >
                {i}
            </button>
        );
    }


    const getLogoUrl = (logoUrl) => {
        if (logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('https'))) {
            return logoUrl;
        }

        return `${BACKEND_URL}/${logoUrl}`;
    };


    return (
        <div className="p-6">
            <h2 className="text-4xl sm:text-6xl mb-16 gradiant-color border-b pb-10 flex items-center justify-center 
                    streetFighterTypo">
                PROMOTORAS
            </h2>

            {/* FORMULARIO DE BÚSQUEDA */}
            <form onSubmit={handleSearch} className="mb-8 flex justify-center ">
                <input
                    type="text"
                    placeholder="Buscar compañía"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg h-9 p-3 border border-gray-300 rounded-l-lg
                    text-gray-800 opacity-65"
                />
                <button
                    type="submit"
                    className="bg-gradient-to-b from-custom-red to-custom-gold px-6 py-1 rounded-r-lg 
                    transition h-9 font-medium"
                >
                    Buscar
                </button>
            </form>

            {/* TARJETA DE LAS COMPAÑÍAS */}
            <div className="card mt-12 mb-20">
                {companies.map(company => (
                    <div key={company.company_id}
                        onClick={() => navigate(`/promotoras/${company.slug}`)}
                        className="bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2  border-b-custom-gold hover:shadow-2xl hover:scale-105 
                    transition duration-300 cursor-pointer ">
                        <h3 className="text-base font-bold text-custom-black mb-5 text-center">
                            {company.name}
                        </h3>
                        {<div className="mb-3 flex justify-center items-center">
                            {company.logo_url ? (
                                <img
                                    src={getLogoUrl(company.logo_url)}
                                    alt={`Foto de ${company.name}`}
                                    className="card_logo-company"
                                />
                            ) : (
                                <img
                                    src={avatar}
                                    alt={`Avatar de compañía`}
                                    className="card_logo-avatar"
                                />
                            )}
                        </div>}

                        <p className="text-sm text-custom-black font-medium">
                            País: {" "}
                            <span className="font-semibold">
                                {company.country || 'No Disponible'}
                            </span>
                        </p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-sm text-gray-700">
                            <span className='text-custom-black'>
                                Ciudad: {" "}
                                <span className="text-custom-blue font-semibold">
                                    {company.headquarters || 'No disponible'}
                                </span>
                            </span>
                            <span className="font-semibold text-green-700">
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm transition 
                                duration-150 font-medium flex items-center"
                                    >
                                        <span className='text-green-700 hover:text-emerald-900'>
                                            Visitar página web
                                        </span>
                                    </a>
                                )}
                                {!company.website && (
                                    <p className="text-sm text-gray-500">
                                        Web no disponible
                                    </p>
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINACIÓN */}
            {total_pages > 1 && (
                <div className="mt-10 flex flex-nowrap flex-1 justify-center items-center space-x-2">
                    <button
                        onClick={() => goToPage(current_page - 1)}
                        disabled={current_page === 1}
                        className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 
                                transition disabled:opacity-50 text-sm"
                    >
                        Anterior
                    </button>

                    <div className="flex flex-nowrap justify-center">
                        {pageButtons}
                    </div>

                    <button
                        onClick={() => goToPage(current_page + 1)}
                        disabled={current_page === total_pages}
                        className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 
                                transition disabled:opacity-50 text-sm"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};