import React, { useEffect, useState } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import useFetchNews from '../hooks/useFetchNews';

export const HomePage = () => {

    const {
        news,
        loading,
        error,
        pagination,
        goToPage,
        fetchNews,
        searchTerm,
    } = useFetchNews(5);

    const { current_page, total_pages, total_items } = pagination;


    const handleGoToPage = (pageNumber) => {
        goToPage(pageNumber, searchTerm);
    }

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };


    return (
        <main className="text-center mt-16 p-4 mx-auto font-serif max-w-6xl">
            {/* Título Principal */}
            <div className='bg-gray-200 bg-opacity-65 p-6 
                        shadow-xl rounded-xl border-l-2 border-l-custom-red border-b-2 border-b-custom-gold 
                        hover:shadow-2xl text-left transition-all'>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-center">
                    <span className="text-custom-black">
                        El Catálogo definitivo de MMA en Español
                    </span>
                </h1>

                {/* Subtítulo */}
                <h2 className="text-xl md:text-2xl text-custom-red font-extrabold mb-8 text-center">
                    Explora la comunidad española de las Artes Marciales Mixtas de España
                </h2>
            </div>
            {/* SECCIÓN NOTICIAS */}
            <section className="grid grid-cols-1 gap-10 mt-20">

                <div className='flex justify-center'>
                    <h2 className="bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                        border-l-2 border-l-custom-red border-b-2 border-b-custom-gold 
                        text-3xl font-bold w-auto text-custom-red">
                        ÚLTIMAS NOTICIAS
                    </h2>
                </div>

                {loading && <p className="text-xl">Cargando noticias...</p>}
                {error && <p className="text-red-500 italic">Error: {error}</p>}


                {/* ARTÍCULO  */}
                {!loading && !error && news && news.length > 0 ? (
                    news.map((item) => (
                        <article key={item.news_id} className="articles-item bg-gray-200 bg-opacity-65 p-6 
                        shadow-xl rounded-xl border-l-2 border-l-custom-red border-b-2 border-b-custom-gold 
                        hover:shadow-2xl text-left transition-all">
                            <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b
                             border-gray-300 pb-2">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                                    {item.title}
                                </h2>
                                <div className="articles-data text-white font-sans italic">
                                    <span>{formatDate(item.published_at)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:justify-between gap-6 items-start">
                                <div className="shrink-0 mx-auto md:mx-0">
                                    <img
                                        src={item.image_url ? `${BACKEND_URL}/${item.image_url}` : '/images/Error404.jpg'}
                                        alt={item.title}
                                        className='card_photo-news w-full md:w-80 h-48 object-cover rounded-lg shadow-md'
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="articles-description text-gray-700 leading-relaxed">
                                        {item.content.length > 300 ? `${item.content.substring(0, 300)}...` : item.content}
                                    </p>
                                    <button className="mt-4 text-red-600 font-bold hover:underline">
                                        Leer más...
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    !loading && <p>No se encontraron noticias.</p>
                )}

                {/* PAGINACIÓN */}
                {total_pages > 1 && (
                    <div className="mt-10 flex flex-nowrap justify-center items-center space-x-2">
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

            </section>
        </main>
    )
}