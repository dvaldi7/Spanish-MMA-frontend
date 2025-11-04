import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiX } from 'react-icons/fi';

const WEIGHT_CLASSES = [
    'Peso Paja', 'Peso Mosca', 'Peso Gallo', 'Peso Pluma',
    'Peso Ligero', 'Peso Welter', 'Peso Mediano', 'Peso Semi-pesado', 'Peso Pesado'
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
    photo_url: '',
};

// Recibe la ID del peleador a editar o null para crear
const FighterFormModal = ({ fighterIdToEdit, isModalOpen, closeModal, onFighterSaved }) => {

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [companies, setCompanies] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const isEditMode = !!fighterIdToEdit;

    //UseEffect para los peleadores
    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setValidationErrors({});
            setImageFile(null);
            return;
        }

        if (isEditMode) {

            const fetchFighterData = async () => {
                setIsLoading(true);
                try {

                    const response = await api.get(`/fighters/id/${fighterIdToEdit}`);
                    const fighterData = response.data;


                    const loadedData = {
                        first_name: fighterData.first_name || '',
                        last_name: fighterData.last_name || '',
                        nickname: fighterData.nickname || '',
                        weight_class: fighterData.weight_class || '',
                        record_wins: response.data.record_wins || 0,
                        record_losses: response.data.record_losses || 0,
                        record_draws: response.data.record_draws || 0,
                        company_id: response.data.company_id || '',
                        photo_url: fighterData.photo_url || '',
                    };

                    setFormData(loadedData);

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

    // useEffect para las compañías
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get('/companies');
                setCompanies(response.data.companies || []);

            } catch (error) {
                console.error("Error al cargar las compañías: ", error);
            }
        };

        if (isModalOpen) {
            fetchCompanies();
        }
    }, [isModalOpen]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setImageFile(files[0]);
            setValidationErrors(prev => ({ ...prev, photo_file: '' }));

        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            }));
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
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

        if (!validateForm()) {
            setError('Por favor, corrige los errores en el formulario.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formPayload = new FormData();

        for (const key in formData) {
            if (['company_name', 'company_slug', 'slug', 'photo_url'].includes(key)) continue;

            let value = formData[key];
            if (key === 'company_id') {
                value = value === '' || value === null ? '' : String(value);
            }

            formPayload.append(key, value);
        }

        if (imageFile) {
            formPayload.append('photo', imageFile);
        } else if (isEditMode) {
            if (!formData.photo_url) {
                formPayload.append('photo_url', '');
            }
        }

        try {
            if (isEditMode) {
                await api.put(`/fighters/id/${fighterIdToEdit}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Peleador actualizado con éxito!');
            } else {
                await api.post('/fighters', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Peleador creado con éxito!');
            }

            onFighterSaved();
            closeModal();
        } catch (error) {
            console.error("Error al guardar peleador: ", error);
            const msg = error.response?.data?.message || 'Error desconocido al guardar el peleador.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 flex justify-center items-center z-50">
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

                    {/* Foto */}
                    <div>
                        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                            Foto del peleador
                        </label>

                        <input
                            type="file"
                            name="photo"
                            id="photo"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setImageFile(file);

                                if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    setFormData((prev) => ({ ...prev, photo_url: previewUrl }));
                                }
                            }}
                            className="mt-1 block w-full text-sm text-gray-900 
                            border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        />

                        {formData.photo_url && (
                            <div className="mt-3">
                                <img
                                    src={
                                        imageFile
                                            ? formData.photo_url
                                            : `http://localhost:3001/${formData.photo_url}`
                                    }
                                    alt={`imagen de ${formData.name || 'peleador'}`}
                                    className="h-40 w-40 object-cover rounded-lg border border-gray-300 shadow-md"
                                />
                            </div>
                        )}

                        <p className="mt-1 text-xs text-gray-500" id="file_help">
                            {isEditMode && formData.photo_url
                                ? `Foto actual cargada. Sube una nueva para reemplazarla.`
                                : `Formatos aceptados: PNG, JPG, WEBP.`}
                        </p>

                        {validationErrors.photo_file && (
                            <p className="text-red-500 text-xs mt-1">
                                {validationErrors.photo_file}
                            </p>
                        )}
                    </div>

                    {/* Récord  */}
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
                            Compañía
                        </label>
                        <select
                            name="company_id"
                            value={formData.company_id === null ? '' : String(formData.company_id)}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value=""> Sin compañía (N/A) </option>
                            {Array.isArray(companies) && companies.map(company =>
                                <option
                                    key={company.company_id}
                                    value={company.company_id}
                                >
                                    {company.name}
                                </option>
                            )}
                        </select>
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