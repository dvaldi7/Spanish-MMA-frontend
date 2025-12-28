import React from 'react'

export const HomePage = () => {
    return (
        <main className="text-center mt-16 p-4 mx-auto font-serif max-w-6xl">
            {/* Título Principal */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent ">
                    El Catálogo definitivo de MMA en Español
                </span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-xl md:text-2xl bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text 
                text-transparent font-extrabold mb-8 ">
                Explora la comunidad española de las Artes Marciales Mixtas de España
            </h2>

            {/* SECCIÓN NOTICIAS */}
            <section className="grid grid-cols-1 gap-10 mt-20">
                
                <div className='flex justify-center'>
                    <h2 className="bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                        border-l-2 border-l-custom-red border-b-2 border-b-custom-gold 
                        text-3xl font-bold w-auto">
                        ÚLTIMAS NOTICIAS
                    </h2>
                </div>

                {/* ARTÍCULO  */}
                <article className="articles-item bg-gray-200 bg-opacity-65 p-6 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2 border-b-custom-gold hover:shadow-2xl text-left">
                    
                    {/* TÍTULO Y FECHA */}
                    <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-gray-300 pb-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-5">
                            Título de la noticia
                        </h2>
                        <div className="articles-data">
                            <span>10/03/2025</span>
                        </div>
                    </div>

                    {/* IMAGEN Y TEXTO */}
                    <div className="flex flex-col md:flex-row md:justify-between gap-6 items-start">
                      
                        <div className="shrink-0 mx-auto md:mx-0">
                            <img 
                                src='/images/Error404.jpg' 
                                alt='Noticia' 
                                className='card_photo-news w-full md:w-80 object-cover rounded-lg' 
                            />
                        </div>

                        <div className="flex-1">
                            <p className="articles-description text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eu pellentesque enim,
                                vitae consequat enim. Quisque congue dictum vehicula. Mauris placerat augue sed
                                metus egestas, a pulvinar orci lobortis. Quisque semper, justo vel elementum consectetur,
                                augue lectus ullamcorper libero, nec luctus mi velit nec massa.
                            </p>
                        </div>
                    </div>
                </article>
                {/*  FIN ARTÍCULO*/}
                 
                 {/* ARTÍCULO  */}
                <article className="articles-item bg-gray-200 bg-opacity-65 p-6 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2 border-b-custom-gold hover:shadow-2xl text-left">
                    
                    {/* TÍTULO Y FECHA */}
                    <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-gray-300 pb-2">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Título de la noticia
                        </h2>
                        <div className="articles-data">
                            <span>10/03/2025</span>
                        </div>
                    </div>

                    {/* IMAGEN Y TEXTO */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      
                        <div className="shrink-0 mx-auto md:mx-0">
                            <img 
                                src='/images/Error404.jpg' 
                                alt='Noticia' 
                                className='card_photo-news w-full md:w-80 object-cover rounded-lg' 
                            />
                        </div>

                        <div className="flex-1">
                            <p className="articles-description text-gray-700 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eu pellentesque enim,
                                vitae consequat enim. Quisque congue dictum vehicula. Mauris placerat augue sed
                                metus egestas, a pulvinar orci lobortis. Quisque semper, justo vel elementum consectetur,
                                augue lectus ullamcorper libero, nec luctus mi velit nec massa.
                            </p>
                        </div>
                    </div>
                </article>
                {/*  FIN ARTÍCULO*/}
                 

            </section>
        </main>
    )
}