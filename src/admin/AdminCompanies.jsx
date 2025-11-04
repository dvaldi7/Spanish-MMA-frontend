import React, { useState } from 'react';
import useFetchCompanies from '../hooks/useFetchCompanies';
import { CompanyFormModal } from '../components/CompanyFormModal';
import api from '../services/api';

export const AdminCompanies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState(null);

    const {
        companies,
        pagination,
        loading,
        error,
        goToPage,
        fetchCompanies,
        currentPage,
    } = useFetchCompanies(10);

    /* CREAR */
    const openCreateModal = () => {
        setCompanyToEdit(null);
        setShowModal(true);
    };

    /* EDITAR */
    const openEditModal = (company) => {
        setCompanyToEdit(company);
        setShowModal(true);
    };

    /* REFRESACAR DESPUES DE HACER ACCIÓN */
    const handleSaveSuccess = () => {
        fetchCompanies(pagination.current_page, pagination.limit, searchTerm);
    };

    /* BORRAR */
    const handleDelete = async (companyId, companyName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la compañía: ${companyName}?`)) {
            try {
                await api.delete(`/companies/${companyId}`);
                alert('Compañía eliminada exitosamente.');
                handleSaveSuccess();

            } catch (error) {
                console.error("Error al borrar la compañía:", error);
                alert('Error al eliminar. Revisa la consola (posiblemente la compañía tenga peleadores asociados).');
            }
        }
    };



    return (
        <div className="p-6">

            {/* Título y Botón de Crear */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-2xl font-semibold gradiant-color">
                    Compañías
                </h2>
                <button
                    onClick={openCreateModal}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                    Crear Compañía
                </button>
            </div>

            {/* FORMULARIO DE BÚSQUEDA */}

            {/* TARJETA DE LAS COMPAÑÍAS */}
            <div className="card mt-12 mb-20">
                {companies.map(company => (
                    <div key={company.company_id} className="... tu estilo de tarjeta ...">
                        {/* ... contenido de la tarjeta ... */}

                        {/* Botones de Acción */}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => openEditModal(company)}
                                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(company.company_id, company.name)}
                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                            >
                                Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {/* Controles de Paginación */}
            <div className="flex justify-center items-center mt-6">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="text-sm text-gray-700 mx-4">Página {currentPage} de {totalPages}</span>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            {/* Modal de Formulario */}
            {showModal && (
                <CompanyFormModal
                    companyToEdit={companyToEdit}
                    onClose={() => setShowModal(false)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};