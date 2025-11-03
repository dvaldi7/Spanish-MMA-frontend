// Asegúrate de que tu componente principal de administración tenga la lógica del modal y borrado.

import React, { useState } from 'react';
import useFetchCompanies from '../hooks/useFetchCompanies';
import { CompanyFormModal } from '../components/CompanyFormModal'; // Importar el modal
import api from '../services/api';
// ... otros imports

export const AdminCompanies = () => { // Cambia CompanyList por AdminCompanies
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar modal
    const [companyToEdit, setCompanyToEdit] = useState(null); // Compañía a editar (null = crear)

    const {
        companies,
        pagination,
        loading,
        error,
        goToPage,
        fetchCompanies, // Esta función es clave para recargar la lista
    } = useFetchCompanies(10);

    // ----------------------------------------------------
    // Lógica del Modal (Crear / Editar)
    // ----------------------------------------------------
    const openCreateModal = () => {
        setCompanyToEdit(null); // Para crear
        setShowModal(true);
    };

    const openEditModal = (company) => {
        setCompanyToEdit(company); // Para editar
        setShowModal(true);
    };

    const handleSaveSuccess = () => {
        // Recargar la lista de compañías después de una creación/actualización
        fetchCompanies(pagination.current_page, pagination.limit, searchTerm);
    };

    // ----------------------------------------------------
    // Lógica de Borrado
    // ----------------------------------------------------
    const handleDelete = async (companyId, companyName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la compañía: ${companyName}?`)) {
            try {
                await api.delete(`/companies/${companyId}`);
                alert('Compañía eliminada exitosamente.');
                handleSaveSuccess(); // Recargar la lista

            } catch (error) {
                console.error("Error al borrar la compañía:", error);
                alert('Error al eliminar. Revisa la consola (posiblemente la compañía tenga peleadores asociados).');
            }
        }
    };

    // ... handleSearch y lógica de paginación ...

    return (
        <div className="p-6">
            {/* Título y Botón de Crear */}
            <div className="flex justify-between items-center mb-10 border-b pb-4">
                <h2 className="text-4xl font-bold gradiant-color">PROMOTORAS</h2>
                <button
                    onClick={openCreateModal}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                    + Crear Compañía
                </button>
            </div>

            {/* FORMULARIO DE BÚSQUEDA */}
            {/* ... tu código de formulario de búsqueda ... */}

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

            {/* PAGINACIÓN */}
            {/* ... tu código de paginación ... */}

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