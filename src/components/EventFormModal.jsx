import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiX } from 'react-icons/fi';


const initialFormState = {
    name: '',
    poster_url: '',
    location: '',
    event_id: null,
    is_completed: 'false',
    date: '',
};

// Recibe la ID del evento a editar o null para crear
const EventFormModal = ({ eventIdToEdit, isModalOpen, closeModal, onEventSaved }) => {

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [events, setEvents] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const isEditMode = !!eventIdToEdit;

    //UseEffect para los eventoes
    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setValidationErrors({});
            setImageFile(null);
            return;
        }

        if (isEditMode) {

            const fetchEventData = async () => {
                setIsLoading(true);
                try {

                    const response = await api.get(`/events/id/${eventIdToEdit}`);
                    const eventData = response.data.event;


                    const loadedData = {
                        name: eventData.name || '',
                        location: eventData.location || '',
                        date: eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '', 
                        event_id: eventData.event_id || null,
                        poster_url: eventData.poster_url || '',
                        is_completed: String(eventData.is_completed || false),
                    };
                
                    setFormData(loadedData);

                } catch (error) {
                    console.error("Error al cargar datos del evento: ", error);
                    setError("No se pudieron cargar los datos para editar");

                } finally {
                    setIsLoading(false);
                }
            };

            fetchEventData();

        } else {

            setFormData(initialFormState);
        }

    }, [isModalOpen, eventIdToEdit, isEditMode]);

    // useEffect para los eventos
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data.events || []);

            } catch (error) {
                console.error("Error al cargar los eventos: ", error);
            }
        };

        if (isModalOpen) {
            fetchEvents();
        }
    }, [isModalOpen]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setImageFile(files[0]);
            setValidationErrors(prev => ({ ...prev, poster_file: '' }));

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

        if (!formData.name.trim()) errors.name = "El campo nombre es obligatorio";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Por favor, corrige los errores en el formulario');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formPayload = new FormData();

     const fieldsToExcludeFromPayload = ['poster_url', 'event_id'];

        for (const key in formData) {
            if (fieldsToExcludeFromPayload.includes(key)) continue; 
            
            formPayload.append(key, formData[key]);
        }

        if (imageFile) {
            formPayload.append('poster', imageFile);
        } else if (isEditMode) {
            if (!formData.poster_url) {
                formPayload.append('poster_url', '');
            }
        }

        try {
            if (isEditMode) {
                await api.put(`/events/id/${eventIdToEdit}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Evento actualizado con éxito!');
            } else {
                await api.post('/events', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Evento creado con éxito!');
            }

            onEventSaved();
            closeModal();
        } catch (error) {
            console.error("Error al guardar el evento: ", error);
            const msg = error.response?.data?.message || 'Error desconocido al guardar el evento';
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
                        {isEditMode ? `Editar Evento ID: ${eventIdToEdit}` : 'Crear Nuevo Evento'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                {isLoading && isEditMode && <p>Cargando datos...</p>}
                {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
                {validationErrors.record && <p className="text-red-500 mb-4 font-medium">{validationErrors.record}</p>}


                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nombre  */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {validationErrors.name && <p className="text-red-500 text-xs mt-1">
                                {validationErrors.name}
                            </p>}
                        </div>
                    </div>

                    {/* Ubicación del evento */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                                Ubicación
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                                Fecha
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>


                    {/* Poster del evento */}
                    <div>
                        <label htmlFor="poster" className="block text-sm font-medium text-gray-700">
                            Poster del evento
                        </label>

                        <input
                            type="file"
                            name="poster"
                            id="poster"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setImageFile(file);

                                if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    setFormData((prev) => ({ ...prev, poster_url: previewUrl }));
                                }
                            }}
                            className="mt-1 block w-full text-sm text-gray-900 
                            border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        />

                        {formData.poster_url && (
                            <div className="mt-3">
                                <img
                                    src={
                                        imageFile
                                            ? formData.poster_url
                                            : `http://localhost:3001/${formData.poster_url}`
                                    }
                                    alt={`imagen de ${formData.name || 'evento'}`}
                                    className="h-40 w-40 object-cover rounded-lg border border-gray-300 shadow-md"
                                />
                            </div>
                        )}

                        <p className="mt-1 text-xs text-gray-500" id="file_help">
                            {isEditMode && formData.poster_url
                                ? `Foto actual cargada. Sube una nueva para reemplazarla.`
                                : `Formatos aceptados: PNG, JPG, WEBP.`}
                        </p>

                        {validationErrors.poster_file && (
                            <p className="text-red-500 text-xs mt-1">
                                {validationErrors.poster_file}
                            </p>
                        )}
                    </div>

                    {/* Botón de Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700
                         disabled:bg-gray-400"
                    >
                        {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Evento'}
                    </button>
                </form>
            </div>
        </div>     
    );
}

export default EventFormModal;