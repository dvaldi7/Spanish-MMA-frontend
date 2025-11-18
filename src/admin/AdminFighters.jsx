import React, { useState, useEffect } from 'react';
import useFetchFighters from '../hooks/useFetchFighters';
import api from '../services/api';
import FighterFormModal from '../components/FighterFormModal';
import avatar from "/images/fighters/avatar.png";


const AdminFighters = () => {

    const {
        fighters,
        loading,
        error,
        goToPage,
        pagination,
        fetchFighters,
    } = useFetchFighters();

    const currentPage = pagination.current_page;
    const totalPages = pagination.total_pages;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fighterIdToEdit, setFighterIdToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    //Para el buscador
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchFighters(1, pagination.limit, searchTerm);
        }, 500); 

        return () => clearTimeout(delaySearch);
    }, [searchTerm, fetchFighters, pagination.limit]);


    const handleSearchChange = (e) => {
        //Este para buscar mientras escribes
        setSearchTerm(e.target.value);
    };

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

    const handleDelete = async (fighterId) => {

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

    if (loading) return <div className="p-6 text-gray-600">Cargando peleadores...</div>;
    if (error) return <div className="p-6 text-red-600 font-semibold">Error al cargar: {error.message}</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen opacity-85 rounded-lg mt-10">

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-lg md:text-2xl font-semibold gradiant-color">
                    Gestión de Peleadores
                </h2>
                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow-md
                     hover:bg-green-700 transition duration-150 text-sm font-semibold"
                >
                    Crear Nuevo Peleador
                </button>
            </div>

            <div className="mb-4">

                <input
                    type="text"
                    placeholder="Buscar por nombre o apodo..."
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
                                Foto
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
                                Apodo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">
                                Compañía
                            </th>

                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {fighters.map(fighter => (

                            <tr key={fighter.fighter_id} className="hover:bg-gray-50">

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={fighter.photo_url
                                            ? `http://localhost:3001/${fighter.photo_url}`
                                            : avatar}
                                        alt={`Foto de ${fighter.first_name}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = { avatar };
                                        }}
                                    />
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {fighter.fighter_id}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                    {fighter.first_name} {fighter.last_name}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {fighter.nickname}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500
                                ">{fighter.company_name || 'N/A'}</td>

                                <td className="px-6 py-4 whitespace-nowrap flex items-center text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(fighter.fighter_id)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition 
                                        duration-150 font-bold"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fighter.fighter_id)}
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
                    {fighters.map(fighter => (
                        <div key={fighter.fighter_id} className="p-4 flex justify-between items-center bg-white
                         hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={fighter.photo_url
                                            ? `http://localhost:3001/${fighter.photo_url}`
                                            : avatar}
                                    className="h-10 w-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = { avatar };
                                    }}
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {fighter.first_name} {fighter.last_name}</div>
                                    <div className="text-xs text-gray-500">{fighter.nickname || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1 grid-rows-1">
                                <button
                                    onClick={() => openEditModal(fighter.fighter_id)}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-bold"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(fighter.fighter_id)}
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

            <FighterFormModal

                fighterIdToEdit={fighterIdToEdit}
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                onFighterSaved={handleFighterSaved}
            />
        </div>
    );
};

export default AdminFighters;