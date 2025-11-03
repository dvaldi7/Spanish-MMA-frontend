import React, { useState } from 'react';
import useFetchFighters from '../hooks/useFetchFighters';
import api from '../services/api';
import FighterFormModal from '../components/FighterFormModal';

export const AdminFighters = () => {

    const {
        fighters,
        isLoading,
        error,
        totalPages,
        currentPage,
        goToPage,
        setSearchTerm,
        searchTerm,
        pagination,
    } = useFetchFighters();

    // Estados para el Modal (Crear/Editar)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fighterIdToEdit, setFighterIdToEdit] = useState(null);

    //mManejadores
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    //Crear y/o editar peleadores 
    const openCreateModal = () => {
        setFighterIdToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (fighterId) => {
        setFighterIdToEdit(fighterId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFighterIdToEdit(null);
    };

    const handleFighterSaved = () => {
        goToPage(pagination.current_page);
    };

    //Borrar peleadores
    const handleDelete = async (fighterId) => {

        /* por si no quiero eliminar */
        if (!window.confirm(`¿Estás seguro de eliminar al peleador con ID ${fighterId}?`)) {
            return;
        }

        try {
            await api.delete(`/fighters/id/${fighterId}`);
            console.log("Peleador eliminado con éxito");

            goToPage(pagination.current_page);

        } catch (error) {
            console.error("Error al eliminar al peleador: ", error);
        }
    };

    if (isLoading) return <div className="p-6 text-gray-600">Cargando peleadores...</div>;
    if (error) return <div className="p-6 text-red-600 font-semibold">Error al cargar: {error.message}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen opacity-85 rounded-lg mt-10">

            {/* Encabezado y Botón Crear */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Gestión de Peleadores
                </h2>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-150"
                >
                    Crear Nuevo Peleador
                </button>
            </div>

            {/* Buscador */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o apodo..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded-lg w-full max-w-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Tabla de Datos */}
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">

                    <thead className="bg-gray-100">
                        <tr>
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
                                Apodo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Compañía
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {fighters.map(fighter => (

                            <tr key={fighter.fighter_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {fighter.fighter_id}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {fighter.first_name} {fighter.last_name}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {fighter.nickname}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500
                                ">{fighter.company_name || 'N/A'}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(fighter.fighter_id)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition 
                                        duration-150"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fighter.fighter_id)}
                                        className="text-red-600 hover:text-red-900 transition duration-150"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

            {/* Controles de Paginación */}
            <div className="flex justify-center items-center mt-6">
                <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="text-sm text-gray-700 mx-4">Página {currentPage} de {totalPages}</span>
                <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            {/* El modal del peleador para cambiar, crear o editar peleadores */}
            <FighterFormModal
              
                fighterIdToEdit={fighterIdToEdit} 
                isModalOpen={isModalOpen}         
                closeModal={closeModal}          
                onFighterSaved={handleFighterSaved}
            />
        </div>
    );
};