import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiX } from 'react-icons/fi';

const initialFormState = {
    name: '',
    logo_url: '', 
    headquarters: '',
    country: '',
    website: '',
};

const CompanyFormModal = ({ companyIdToEdit, isModalOpen, closeModal, onCompanySaved }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);

    const isEditMode = !!companyIdToEdit;

    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setValidationErrors({});
            setImageFile(null);
            return;
        }

        if (isEditMode) {
            const fetchCompanyData = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/companies/id/${companyIdToEdit}`);
                    const companyData = response.data.company;

                    setFormData({
                        name: companyData.name || '',
                        headquarters: companyData.headquarters || '', 
                        country: companyData.country || '',
                        website: companyData.website || '',
                        logo_url: companyData.logo_url || '',
                    });

                } catch (error) {
                    console.error("Error al cargar datos de la compañía: ", error);
                    setError("No se pudieron cargar los datos para editar");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCompanyData();
        }
    }, [isModalOpen, companyIdToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setImageFile(files[0]);
            setValidationErrors(prev => ({ ...prev, logo_file: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {}
        if (!formData.name.trim()) errors.name = "El campo nombre es obligatorio";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return setError('Por favor, corrige los errores en el formulario');

        setIsLoading(true);
        setError(null);

        const formPayload = new FormData();
        // Campos que no deben ir directamente al loop de strings
        const fieldsToExclude = ['logo_url'];

        for (const key in formData) {
            if (fieldsToExclude.includes(key)) continue;
            formPayload.append(key, formData[key] || '');
        }

        if (imageFile) {
            formPayload.append('logo', imageFile); 
        } else if (isEditMode && !formData.logo_url) {
            // Si estamos editando y se borró la imagen
            formPayload.append('logo_url', '');
        }

        try {
            if (isEditMode) {
                await api.put(`/companies/id/${companyIdToEdit}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Compañía actualizada con éxito!');
            } else {
                await api.post('/companies', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Compañía creada con éxito!');
            }

            onCompanySaved();
            closeModal();
        } catch (error) {
            console.error("Error al guardar compañía: ", error);
            const msg = error.response?.data?.message || 'Error desconocido';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold">
                        {isEditMode ? `Editar Compañía ID: ${companyIdToEdit}` : 'Crear Nueva Compañía'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                {isLoading && isEditMode && <p>Cargando datos...</p>}
                {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">País</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ciudad / Sede</label>
                            <input
                                type="text"
                                name="headquarters"
                                value={formData.headquarters}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Web</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="https://ejemplo.com"
                            />
                        </div>
                    </div>
     
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo de la Compañía</label>
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setImageFile(file);
                                if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    setFormData((prev) => ({ ...prev, logo_url: previewUrl }));
                                }
                            }}
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        />

                        {formData.logo_url && (
                            <div className="mt-3">
                                <img
                                    src={
                                        formData.logo_url.startsWith('blob:') || formData.logo_url.startsWith('http')
                                            ? formData.logo_url
                                            : `http://localhost:3001/${formData.logo_url}`
                                    }
                                    alt={`logo de ${formData.name || 'compañía'}`}
                                    className="h-40 w-40 object-contain rounded-lg border border-gray-300 shadow-md p-2 bg-white"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Compañía'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CompanyFormModal;