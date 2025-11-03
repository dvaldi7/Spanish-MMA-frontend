import React, { useState, useEffect } from 'react';
import api from '../services/api';

const initialFormState = {
    name: '',
    headquarters: '',
    country: '',
    website: '',
    logo_url: '',
    description: '',
};

// Recibe la compañía a editar (o null para crear) y funciones de control
export const CompanyFormModal = ({ companyToEdit, onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 💡 1. Rellenar el formulario si estamos editando
    useEffect(() => {
        if (companyToEdit) {
            setFormData(companyToEdit);
        } else {
            setFormData(initialFormState);
        }
    }, [companyToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const isEditing = !!companyToEdit;
        const url = isEditing ? `/companies/${companyToEdit.company_id}` : '/companies';
        const method = isEditing ? api.put : api.post;

        try {
            await method(url, formData);
            
            // 2. Si tiene éxito, llama a la función para recargar la lista
            onSaveSuccess();
            onClose(); // Cierra el modal

        } catch (err) {
            console.error("Error al guardar la compañía:", err);
            // Mostrar un mensaje de error al usuario
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} compañía. Ver consola.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {companyToEdit ? 'Editar Compañía' : 'Crear Nueva Compañía'}
                </h2>
                
                {/* Botón para cerrar */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    &times;
                </button>

                <form onSubmit={handleSubmit}>
                    
                    {/* Campos de texto obligatorios */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombre *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Sede (Ciudad) *</label>
                        <input type="text" name="headquarters" value={formData.headquarters} onChange={handleChange} required
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">País *</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} required
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>

                    {/* Campos de texto opcionales */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Sitio Web</label>
                        <input type="text" name="website" value={formData.website} onChange={handleChange}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Logo URL</label>
                        <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-20"></textarea>
                    </div>

                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    
                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={loading}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
                            {loading ? 'Guardando...' : companyToEdit ? 'Actualizar' : 'Crear Compañía'}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading}
                                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};