import React from 'react'

export const Error404 = () => {
    return (
        <>
            <h1 className='text-4xl sm:text-6xl mb-16 gradiant-color pb-10 flex items-center justify-center text-center'>
                ¡ Ups, parece que ha habido un error !
            </h1>

            <div className='flex items-center justify-center'>
                <img src='/images/Error404.jpg' alt='Error 404' />
            </div>

        </>
    )
}
