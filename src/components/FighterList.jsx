import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchFighters from '../hooks/useFetchFighters';
import avatar from "/images/fighters/avatar.png";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const FighterList = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const {
        fighters,
        pagination,
        loading,
        error,
        goToPage,
        fetchFighters,
    } = useFetchFighters(10);

    const handleSearch = (e) => {
        e.preventDefault();

        fetchFighters(1, pagination.limit, searchTerm);
    }

    const handleGoToPage = (pageNumber) => {
        goToPage(pageNumber, searchTerm);
    }

    if (loading) return <p className="text-center text-xl p-6 text-custom-black">Cargando luchadores...</p>;
    if (error) return <p className="text-center text-custom-red text-xl p-6">{error}</p>;

    const { current_page, total_pages, total_items } = pagination;

    const pageButtons = [];
    for (let i = 1; i <= total_pages; i++) {
        pageButtons.push(
            <button
                key={i}
                onClick={() => handleGoToPage(i)}
                className={`px-4 py-2 mx-1 rounded-full transition duration-150 text-sm ${i === current_page
                    ? 'bg-custom-red text-custom-gold font-bold shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-200'
                    }`}
            >
                {i}
            </button>
        );
    }

    const getImageUrl = (photoUrl) => {
        if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('https'))) {
            return photoUrl;
        }

        return `${BACKEND_URL}/${photoUrl}`;
    };


    return (
        <div className="p-6">
            <h2 className="text-4xl sm:text-6xl mb-16 gradiant-color border-b pb-10 flex items-center justify-center 
            streetFighterTypo">
                PELEADORES
            </h2>

            {/* FORMULARIO DE BÚSQUEDA */}
            <form onSubmit={handleSearch} className="mb-8 flex justify-center ">
                <input
                    type="text"
                    placeholder="Buscar peleador"
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

            {/* TARJETA DE LOS LUCHADORES */}
            <div className="card mt-12 mb-20">
                {fighters.map(fighter => (
                    <div key={fighter.fighter_id}
                        onClick={() => navigate(`/peleadores/${fighter.slug}`)}
                        className="bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2  border-b-custom-gold hover:shadow-2xl hover:scale-105 
                    transition duration-300 cursor-pointer ">
                        <h3 className="text-base font-bold text-custom-black mb-5 text-center">
                            {fighter.nickname
                                ? `${fighter.first_name} "${fighter.nickname}" ${fighter.last_name}`
                                : `${fighter.first_name} ${fighter.last_name}`
                            }

                        </h3>
                        <div className="mb-3 flex justify-center items-center">
                            {fighter.photo_url ? (
                                <img
                                    src={getImageUrl(fighter.photo_url)}
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
                        </div>

                        <p className="text-sm text-gray-600 font-medium">
                            Promotora: {" "}
                            <span className="text-custom-blue font-semibold">
                                {fighter.company_name || 'Libre'}
                            </span>
                        </p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>
                                Peso: {" "}
                                <span className='font-semibold'>
                                    {fighter.weight_class}
                                </span>
                            </span>
                            <span className="font-semibold text-green-700">
                                Récord: {fighter.record_wins}-{fighter.record_losses}-{fighter.record_draws}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINACIÓN */}
            {total_pages > 1 && (
                <div className="mt-10 flex flex-nowrap flex-1 justify-center items-center space-x-2">
                    <button
                        onClick={() => handleGoToPage(current_page - 1)}
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
                        onClick={() => handleGoToPage(current_page + 1)}
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

export default FighterList;