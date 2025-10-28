import React from 'react';
import useFetchCompanies from '../hooks/useFetchCompanies';

export const CompanyList = () => {
    const {
        companies,
        pagination,
        loading,
        error,
        goToPage
    } = useFetchCompanies(10);

    if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando promotoras...</p>;
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


    return (
        <div className="p-6">
            <h2 className="text-4xl sm:text-6xl mb-16 gradiant-color border-b pb-10 flex items-center justify-center 
                    streetFighterTypo">
                PROMOTORAS
            </h2>

            {/* TARJETA DE LAS COMPAÑÍAS */}
            <div className="card mt-12 mb-20">
                {companies.map(company => (
                    <div key={company.company_id} className="bg-gray-200 p-5 shadow-xl rounded-xl border-l-4
                           hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer ">
                        <h3 className="text-base font-bold text-custom-black mb-5 text-center">
                            {company.name}
                        </h3>
                        {/*<div className="mb-3 flex justify-center items-center">
                            {fighter.photo_url ? (
                                <img
                                    src={fighter.photo_url}
                                    alt={`Foto de ${fighter.first_name}`}
                                    className="card_photo-fighter"
                                />
                            ) : (
                                <img
                                    src={avatar}
                                    alt={`Avatar de peleador`}
                                    className="card_photo-avatar"
                                />
                            )}
                        </div>*/}

                        <p className="text-sm text-custom-black font-medium">
                            País: <span className="text-blue-700">{company.country || 'No Disponible'}</span>
                        </p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-sm text-gray-700">
                            <span className='text-custom-black'>Ciudad: <span className="text-custom-red">
                                {company.headquarters}</span></span>
                            <span className="font-semibold text-green-700">
                                {company.website && (
                            <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm transition 
                                duration-150 font-medium flex items-center"
                            >
                             <span className='text-green-700 hover:text-emerald-900'>Visitar página web</span>
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