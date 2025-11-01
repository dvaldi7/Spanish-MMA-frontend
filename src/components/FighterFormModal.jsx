import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiX } from 'react-icons/fi';

const WEIGHT_CLASSES = [
    'Peso Paja', 'Peso Mosca', 'Peso Gallo', 'Peso Pluma',
    'Peso Ligero', 'Peso Welter', 'Peso Mediano', 'Peso Pesado'
];

const initialFormState = {
    first_name: '',
    last_name: '',
    nickname: '',
    record_wins: 0,
    record_losses: 0,
    record_draws: 0,
    weight_class: '',
    company_id: null,
};

// Recibe la ID del peleador a editar o null para crear
const FighterFormModal = ({ fighterIdToEdit, isModalOpen, closeModal, onFighterSaved }) => {

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const isEditMode = !!fighterIdToEdit;

    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setValidationErrors({});
            return;
        }

        if (isEditMode) {

            const fetchFighterData = async () => {
                setIsLoading(true);
                try {

                    const response = await api.get(`/fighters/id/${fighterIdToEdit}`);

                    const loadedData = {
                        ...response.data,
                        record_wins: response.data.record_wins || 0,
                        record_losses: response.data.record_losses || 0,
                        record_draws: response.data.record_draws || 0,
                        company_id: response.data.company_id || '',
                    };

                    setFormData(response.data);
                } catch (error) {
                    console.error("Error al cargar datos del peleador: ", error);
                    setError("No se pudieron cargar los datos para editar");

                } finally {
                    setIsLoading(false);
                }
            };

            fetchFighterData();

        } else {

            setFormData(initialFormState);
        }

    }, [isModalOpen, fighterIdToEdit, isEditMode]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {

        const errors = {}

        if (!formData.first_name.trim()) errors.first_name = "El campo nombre es obligatorio";
        if (!formData.last_name.trim()) errors.last_name = "El campo apellido es obligatorio";
        if (!formData.weight_class) errors.weight_class = "Selecciona un peso para el peleador";
        if (!formData.record_wins < 0 || formData.record_losses < 0 || formData.record_draws < 0) {
            errors.record = "Las estadísticas de combate no pueden ser negativas";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            setError('Por favor, corrige los errores en el formulario.');
            return;
        }

        setIsLoading(true);

        try {
            const dataToSend = {
                ...formData,
                company_id: formData.company_id === '' ? null : parseInt(formData.company_id)
            };

            if (isEditMode) {
                // UPDATE (PUT)
                await api.put(`/fighters/id/${fighterIdToEdit}`, dataToSend);
                alert('Peleador actualizado con éxito!');
            } else {
                // CREATE (POST)
                await api.post('/fighters', dataToSend);
                alert('Peleador creado con éxito!');
            }

            onFighterSaved();
            closeModal();

        } catch (err) {
            const msg = err.response?.data?.message || 'Error en la operación de guardado';
            setError(msg);
            console.error(msg, err);
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
                        {isEditMode ? `Editar Peleador ID: ${fighterIdToEdit}` : 'Crear Nuevo Peleador'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                {isLoading && isEditMode && <p>Cargando datos...</p>}
                {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
                {validationErrors.record && <p className="text-red-500 mb-4 font-medium">{validationErrors.record}</p>}


                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {validationErrors.first_name && <p className="text-red-500 text-xs mt-1">
                                {validationErrors.first_name}
                            </p>}
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {validationErrors.last_name && <p className="text-red-500 text-xs mt-1">
                                {validationErrors.last_name}
                            </p>}
                        </div>
                    </div>

                    {/* Apodo y Clase de Peso */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                                Apodo
                            </label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="weight_class" className="block text-sm font-medium text-gray-700">
                                Clase de Peso
                            </label>
                            <select
                                name="weight_class"
                                value={formData.weight_class}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
                                 bg-white"
                            >
                                <option value="">-- Seleccionar --</option>
                                {WEIGHT_CLASSES.map(wc => (
                                    <option key={wc} value={wc}>{wc}</option>
                                ))}
                            </select>
                            {validationErrors.weight_class && <p className="text-red-500 text-xs mt-1">
                                {validationErrors.weight_class}
                            </p>}
                        </div>
                    </div>

                    {/* Récord (Victorias, Derrotas, Empates) */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-1">
                            Récord (Números enteros)
                        </legend>
                        <div className="grid grid-cols-3 gap-4">

                            <div>
                                <label htmlFor="record_wins" className="block text-xs font-medium text-gray-600">
                                    Victorias
                                </label>
                                <input
                                    type="number"
                                    name="record_wins"
                                    value={formData.record_wins}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            <div>
                                <label htmlFor="record_losses" className="block text-xs font-medium text-gray-600">
                                    Derrotas
                                </label>
                                <input
                                    type="number"
                                    name="record_losses"
                                    value={formData.record_losses}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            <div>
                                <label htmlFor="record_draws" className="block text-xs font-medium text-gray-600">
                                    Empates
                                </label>
                                <input
                                    type="number"
                                    name="record_draws"
                                    value={formData.record_draws}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>
                    </fieldset>
                    <div>

                        <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                            ID de Compañía (Opcional)
                        </label>
                        <input
                            type="number"
                            name="company_id"
                            value={formData.company_id || ''}
                            onChange={handleChange}
                            min="1"
                            placeholder="Ej: 1, 2, 3..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Si está vacío, la compañía será NULL en la base de datos
                        </p>
                    </div>

                    {/* Botón de Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700
                         disabled:bg-gray-400"
                    >
                        {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Peleador'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FighterFormModal;