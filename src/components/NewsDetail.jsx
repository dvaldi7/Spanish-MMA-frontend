import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const NewsDetail = () => {
    const { slug } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BACKEND_URL}/api/news/slug/${slug}`);
                if (!response.ok) throw new Error("No se pudo encontrar la noticia");
                
                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [slug]);

    if (loading) return <div className="text-center mt-20 text-xl font-serif">Cargando noticia...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 font-serif">{error}</div>;
    if (!item) return null;

    return (
        <main className="mt-20 p-4 mx-auto max-w-6xl font-serif">
            {/* Botón Volver */}
            <div className="mb-8 text-left">
                <Link to="/" className="text-custom-red hover:underline font-bold flex items-center gap-2">
                    ← Volver a Inicio
                </Link>
            </div>

            {/* Contenedor Principal (Estilo FighterDetail) */}
            <article className="bg-gray-200 bg-opacity-65 shadow-2xl rounded-2xl overflow-hidden border-l-4 border-l-custom-red border-b-4 border-b-custom-gold">
                
                <div className="flex flex-col lg:flex-row">
                    
                    {/* COLUMNA IZQUIERDA: IMAGEN */}
                    <div className="lg:w-1/2 w-full h-[400px] lg:h-auto overflow-hidden">
                        <img 
                            src={item.image_url ? `${BACKEND_URL}/${item.image_url}` : '/images/Error404.jpg'} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>

                    {/* COLUMNA DERECHA: TEXTO */}
                    <div className="lg:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center text-left">
                        
                        <span className="text-gray-500 text-sm mb-2 font-sans uppercase tracking-widest">
                            {new Date(item.published_at).toLocaleDateString('es-ES', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                        </span>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            {item.title}
                        </h1>

                        <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-amber-500 mb-8 rounded-full"></div>

                        {/* Contenido de la noticia */}
                        <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line font-sans">
                            {item.content}
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
};