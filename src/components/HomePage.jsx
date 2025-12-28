import React from 'react'

export const HomePage = () => {

    return (
        <main className="text-center mt-16 p-4 max-w-4xl mx-auto">
            {/* Título Principal */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent ">
                    El Catálogo definitivo de MMA en Español
                </span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-xl md:text-2xl bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text 
        text-transparent font-medium mb-8 ">
                Explora la comunidad española de las Artes Marciales Mixtas de España
            </h2>

            {/* NOTICIAS */}
            <section class="order-1 flex-grow mr-10 mt-5">

                <h2 class="card articles-header bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2  border-b-custom-gold hover:shadow-2xl cursor-pointer">
                    ÚLTIMAS NOTICIAS
                </h2>

                <article class="articles-item bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2  border-b-custom-gold hover:shadow-2xl cursor-pointer">

                    <div class="articles-data ">
                        <span>Fecha: 10/03/2025</span><span>Categoría: pruebas</span>
                    </div>

                    <h4 class="articles-head">
                        <a href="#">Título de la noticia</a>
                    </h4>

                    <p class="articles-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eu pellentesque enim,
                        vitae consequat enim. Quisque congue dictum vehicula. Mauris placerat augue sed
                        metus egestas, a pulvinar orci lobortis. Quisque semper, justo vel elementum consectetur,
                        augue lectus ullamcorper libero, nec luctus mi velit nec massa.</p>
                </article>

                <article class="articles-item bg-gray-200 bg-opacity-65 p-5 shadow-xl rounded-xl 
                    border-l-2 border-l-custom-red border-b-2  border-b-custom-gold hover:shadow-2xl cursor-pointer">

                    <div class="articles-data ">
                        <span>Fecha: 27/04/1989</span><span>Categoría: pruebas</span>
                    </div>

                    <h4 class="articles-head">
                        <a href="#">Título de la noticia</a>
                    </h4>

                    <p class="articles-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nunc eu pellentesque enim, vitae consequat enim. Quisque congue dictum vehicula.
                        Mauris placerat augue sed metus egestas, a pulvinar orci lobortis. Quisque semper,
                        justo vel elementum consectetur, augue lectus ullamcorper libero, nec luctus mi
                        velit nec massa.
                    </p>

                </article>
            </section>

        </main>

    )
}
