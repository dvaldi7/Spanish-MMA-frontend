import React, { useState, useEffect } from 'react';
import useFetchEvents from '../hooks/useFetchEvents';
import api from '../services/api';
import EventFormModal from '../components/EventFormModal';
import avatar from "/images/events/avatar.jpg";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const AdminEvents = () => {

    const {
        events,
        loading,
        error,
        goToPage,
        pagination,
        fetchEvents,
    } = useFetchEvents();

    const currentPage = pagination.current_page;
    const totalPages = pagination.total_pages;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventIdToEdit, setEventIdToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'Fecha Inválida';
        }
    };

    //Para el buscador
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchEvents(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, fetchEvents, pagination.limit]);


    const handleSearchChange = (e) => {
        //Este para buscar mientras escribes
        setSearchTerm(e.target.value);
    };

    const openCreateModal = () => {
        setEventIdToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (eventId) => {
        setEventIdToEdit(eventId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEventIdToEdit(null);
    };

    const handleEventSaved = () => {
        goToPage(pagination.current_page);
    };

    const handleDelete = async (eventId) => {

        if (!window.confirm(`¿Estás seguro de eliminar el evento con ID ${eventId}?`)) {
            return;
        }

        try {
            await api.delete(`/events/id/${eventId}`);
            console.log(`Evento ID ${eventId} eliminado con éxito.`);

            goToPage(pagination.current_page);

        } catch (error) {
            console.error("Error al eliminar el evento: ", error);
        }
    };

    if (loading) return <div className="p-6 text-gray-600">Cargando eventos...</div>;
    if (error) return <div className="p-6 text-red-600 font-semibold">Error al cargar eventos: {error.message}</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen opacity-85 rounded-lg mt-10">

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-lg md:text-2xl font-semibold gradiant-color">
                    Gestión de Eventos
                </h2>
                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow-md
                     hover:bg-green-700 transition duration-150 text-sm font-semibold"
                >
                    Crear Nuevo Evento
                </button>
            </div>

            <div className="mb-4">

                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded-lg w-full max-w-lg focus:ring-blue-500
                     focus:border-blue-500"
                />

            </div>

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">

                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase
                             tracking-wider">
                                Póster
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Ubicación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Estado
                            </th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map(event => (

                            <tr key={event.event_id} className="hover:bg-gray-50">

                                {/* Póster */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={event.poster_url
                                            ? `${BACKEND_URL}/${event.poster_url}`
                                            : avatar}
                                        alt={`Logo de ${event.name}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = { avatar };
                                        }}
                                    />
                                </td>

                                {/* ID */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {event.event_id}
                                </td>

                                {/* Nombre */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                    {event.name || 'N/A'}
                                </td>

                                {/* Ubicación */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {event.location || 'N/A'}
                                </td>

                                {/* Fecha  */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(event.date)}
                                </td>

                                {/* Estado */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.is_completed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {event.is_completed ? 'Finalizado' : 'Próximo'}
                                    </span>
                                </td>

                                {/* Acciones  */}
                                <td className="px-6 py-4 whitespace-nowrap flex items-center text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(event.event_id)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition 
                                         duration-150 font-bold"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.event_id)}
                                        className="text-red-600 hover:text-red-800 transition duration-150 
                                         font-bold"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

                {/* Vista Móvil */}
                <div className="sm:hidden divide-y divide-gray-200">
                    {events.map(event => (
                        <div key={event.event_id} className="p-4 flex justify-between items-center bg-white
                         hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={event.poster_url
                                            ? `${BACKEND_URL}/${event.poster_url}`
                                            : avatar}
                                    alt={`Póster de ${event.name}`}
                                    className="h-10 w-10 rounded-md object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = avatar;
                                    }}
                                />
                                <div>
                                    {/* Nombre del evento */}
                                    <div className="font-semibold text-gray-900">
                                        {event.name || 'N/A'}</div>
                                    {/* Ubicación y Fecha */}
                                    <div className="text-xs text-gray-500">
                                        {event.location || 'N/A'} - {formatDate(event.date)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1 grid-rows-1">
                                {/* Estado (is_completed) */}
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-1 ${event.is_completed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {event.is_completed ? 'Finalizado' : 'Próximo'}
                                </span>
                                <button
                                    onClick={() => openEditModal(event.event_id)}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-bold"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(event.event_id)}
                                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <div className="flex justify-center items-center mt-6">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm 
                     font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Anterior
                </button>

                <span className="text-sm text-gray-700 mx-4">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                     text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            <EventFormModal

                eventIdToEdit={eventIdToEdit}
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                onEventSaved={handleEventSaved}
            />
        </div>
    );
};

export default AdminEvents;