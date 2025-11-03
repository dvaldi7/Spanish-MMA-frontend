import React, { useState } from 'react';
import useFetchEvents from '../hooks/useFetchEvents';
import avatar from "/images/events/avatar.jpg";

export const EventList = () => {

    const [searchTerm, setSearchTerm] = useState('');

    const {
        events,
        pagination,
        loading,
        error,
        goToPage,
        fetchEvents,
    } = useFetchEvents(10);


    const handleSearch = (e) => {
        e.preventDefault();

        fetchEvents(1, pagination.limit, searchTerm);
    }

    const handleGoToPage = (pageNumber) => {
        goToPage(pageNumber, searchTerm);
    }

    if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando eventos...</p>;
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
                EVENTOS
            </h2>

            {/* FORMULARIO DE BÚSQUEDA */}
            <form onSubmit={handleSearch} className="mb-8 flex justify-center">
                <input
                    type="text"
                    placeholder="Buscar eventos"
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
                {events.map(event => (
                    <div key={event.event_id} className="bg-gray-200 p-5 shadow-xl rounded-xl border-l-4
                           hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer bg-opacity-65">
                        <h3 className="text-base font-bold text-custom-black mb-5 text-center">
                            {event.name}
                        </h3>
                        {<div className="mb-3 flex justify-center items-center">
                            {event.poster_url ? (
                                <img
                                    src={event.poster_url}
                                    alt={`Foto de ${event.name}`}
                                    className="card_poster-event"
                                />
                            ) : (
                                <img
                                    src={avatar}
                                    alt={`Avatar de peleador`}
                                    className="card_poster-avatar"
                                />
                            )}
                        </div>}

                        <p className="text-sm text-custom-black font-medium">
                            Localización: <span className="text-blue-700">{event.location || 'No Disponible'}</span>
                        </p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-sm text-gray-700">
                            <span className='text-custom-black'>Fecha: <span className="text-custom-red">
                                {event.date}</span></span>
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
}
