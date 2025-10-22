import React from 'react';
import useFetchFighters from '../hooks/useFetchFighters';
import avatar from "../../public/images/fighters/avatar.png";

const FighterList = () => {

    const {
        fighters,
        pagination,
        loading,
        error,
        goToPage
    } = useFetchFighters(10);

    if (loading) return <p className="text-center text-xl p-6 text-custom-blue">Cargando luchadores...</p>;
    if (error) return <p className="text-center text-custom-red text-xl p-6">{error}</p>;

    const { current_page, total_pages, total_items } = pagination;

    const pageButtons = [];
    for (let i = 1; i <= total_pages; i++) {
        pageButtons.push(
            <button
                key={i}
                onClick={() => goToPage(i)}
                className={`px-4 py-2 mx-1 rounded-full transition duration-150 text-sm ${i === current_page
                        ? 'bg-custom-red text-custom-gold font-bold shadow-md'
                        : 'bg-gray-200 text-gray-800 hover:bg-blue-200'
                    }`}
            >
                {i}
            </button>
        );
    }


    return (
        <div className="p-6">
            <h2 className="text-3xl font-extrabold mb-16 text-custom-red border-b pb-10 flex
            items-center justify-center">
                PELEADORES
            </h2>

            {/* TARJETA DE LOS LUCHADORES */}
            <div className="card mt-12 mb-20">
                {fighters.map(fighter => (
                    <div key={fighter.fighter_id} className="bg-gray-200 p-5 shadow-xl rounded-xl border-l-4
                   hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 text-center">
                            {fighter.first_name} "{fighter.nickname}" {fighter.last_name}
                        </h3>
                        <div className="mb-3">
                            {fighter.photo_url ? (
                                <img
                                    src={fighter.photo_url}
                                    alt={`Foto de ${fighter.first_name}`}
                                    className="w-full h-72 object-cover rounded-md mb-2 border border-gray-200"
                                />
                            ) : (
                                <img
                                    src={avatar}
                                    alt={`Avatar de peleador`}
                                    className="w-full h-72 object-fit rounded-md mb-2 border border-gray-400"
                                />
                            )}
                        </div>

                        <p className="text-sm text-gray-600 font-medium">
                            Promotora: <span className="text-blue-700">{fighter.company_name || 'Libre'}</span>
                        </p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Peso: {fighter.weight_class}</span>
                            <span className="font-semibold text-green-700">
                                Récord: {fighter.record_wins}-{fighter.record_losses}-{fighter.record_draws}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINACIÓN */}
            {total_pages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center items-center space-x-2">
                    <button
                        onClick={() => goToPage(current_page - 1)}
                        disabled={current_page === 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 
                        transition disabled:opacity-50"
                    >
                        Anterior
                    </button>

                    <div className="flex flex-wrap justify-center">
                        {pageButtons}
                    </div>

                    <button
                        onClick={() => goToPage(current_page + 1)}
                        disabled={current_page === total_pages}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 
                        transition disabled:opacity-50 "
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default FighterList;