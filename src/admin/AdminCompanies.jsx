import React, { useState, useEffect } from 'react';
import useFetchCompanies from '../hooks/useFetchCompanies';
import api from '../services/api';
import CompanyFormModal from '../components/CompanyFormModal';
import avatar from "/images/companies/avatar.jpg";


export const AdminCompanies = () => {

    const {
        companies,
        loading,
        error,
        goToPage,
        pagination,
        fetchCompanies,
    } = useFetchCompanies();

    const currentPage = pagination.current_page;
    const totalPages = pagination.total_pages;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companyIdToEdit, setCompanyIdToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Para el buscador: Lógica de Debounce
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchCompanies(1, pagination.limit, searchTerm);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, fetchCompanies, pagination.limit]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openCreateModal = () => {
        setCompanyIdToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (companyId) => {
        setCompanyIdToEdit(companyId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCompanyIdToEdit(null);
    };

    const handleCompanySaved = () => {
        goToPage(pagination.current_page);
    };

    const handleDelete = async (companyId) => {

        if (!window.confirm(`¿Estás seguro de eliminar la compañía con ID ${companyId}?`)) {
            return;
        }

        try {
            await api.delete(`/companies/id/${companyId}`);
            console.log("Compañía eliminada con éxito");

            goToPage(pagination.current_page);

        } catch (error) {
            console.error("Error al eliminar la compañía: ", error);
        }
    };

    

    if (loading) return <div className="p-6 text-gray-600">Cargando compañías...</div>;
    if (error) return <div className="p-6 text-red-600 font-semibold">Error al cargar: {error.message}</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen opacity-85 rounded-lg mt-10">

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-lg md:text-2xl font-semibold gradiant-color">
                    Gestión de Compañías
                </h2>
                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow-md
                     hover:bg-green-700 transition duration-150 text-sm font-semibold"
                >
                    Crear Nueva Compañía
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre de compañía..."
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
                            tracking-wider">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase
                             tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                            tracking-wider">Nombre</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {companies.map(company => (
                            <tr key={company.company_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={company.logo_url
                                            ? `http://localhost:3001/${company.logo_url}`
                                            : avatar}
                                        alt={`Logo de ${company.name}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium
                                 text-gray-900">{company.company_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500  font-semibold">
                                    {company.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {company.slogan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {company.contact_email}</td>

                                <td className="px-6 py-4 whitespace-nowrap flex items-center text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(company.company_id)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition
                                         duration-150 font-bold"
                                    >Editar</button>
                                    <button
                                        onClick={() => handleDelete(company.company_id)}
                                        className="text-red-600 hover:text-red-800 transition duration-150
                                         font-bold"
                                    >Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Vista Móvil */}
                <div className="sm:hidden divide-y divide-gray-200">
                    {companies.map(company => (
                        <div key={company.company_id} className="p-4 flex justify-between items-center
                         bg-white hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={company.logo_url
                                            ? `http://localhost:3001/${company.logo_url}`
                                            : avatar}
                                    alt={`Logo de ${company.name}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">{company.name}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1 grid-rows-1">
                                <button
                                    onClick={() => openEditModal(company.company_id)}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-bold"
                                >Editar</button>
                                <button
                                    onClick={() => handleDelete(company.company_id)}
                                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                                >Eliminar</button>
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

            <CompanyFormModal
                companyIdToEdit={companyIdToEdit}
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                onCompanySaved={handleCompanySaved}
            />
        </div>
    );
};