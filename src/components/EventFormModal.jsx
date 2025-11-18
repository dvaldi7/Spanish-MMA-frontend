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
    fighter_ids: [],
};

const EventFormModal = ({ eventIdToEdit, isModalOpen, closeModal, onEventSaved }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [fighters, setFighters] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const isEditMode = !!eventIdToEdit;

    // Cargar datos del evento a editar
    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setValidationErrors({});
            setImageFile(null);
            return;
        }

        const fetchEventData = async () => {
            if (!isEditMode) return;
            setIsLoading(true);
            try {
                // Obtener datos del evento
                const response = await api.get(`/events/id/${eventIdToEdit}`);
                const eventData = response.data.event;

                // Obtener los luchadores asignados a este evento
                const fightersResponse = await api.get(`/events/id/${eventIdToEdit}/fighters`);
                const assignedFighters = fightersResponse.data.roster || [];
                
                // Extraer solo los IDs de los luchadores asignados
                const fighterIds = assignedFighters.map(f => f.fighter_id);

                console.log('Luchadores asignados:', fighterIds); // Para debug

                setFormData({
                    name: eventData.name || '',
                    location: eventData.location || '',
                    date: eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '',
                    event_id: eventData.event_id || null,
                    poster_url: eventData.poster_url || '',
                    is_completed: String(eventData.is_completed || false),
                    fighter_ids: fighterIds,
                });
            } catch (err) {
                console.error('Error al cargar datos del evento:', err);
                setError("No se pudieron cargar los datos para editar");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventData();
    }, [isModalOpen, eventIdToEdit, isEditMode]);

    // Cargar todos los luchadores
    useEffect(() => {
        if (!isModalOpen) return;

        const fetchAllFighters = async () => {
            try {
                let allFighters = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const res = await api.get(`/fighters?page=${page}`);
                    const pageFighters = res.data.fighters || [];
                    allFighters = [...allFighters, ...pageFighters];
                    hasMore = pageFighters.length > 0;
                    page++;
                }

                setFighters(allFighters);
            } catch (err) {
                console.error("Error al cargar los luchadores", err);
            }
        };

        fetchAllFighters();
    }, [isModalOpen]);

    const handleChange = e => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setImageFile(files[0]);
            setValidationErrors(prev => ({ ...prev, poster_file: '' }));
        } else if (type === 'checkbox') {
            const fighterId = parseInt(value);
            setFormData(prev => {
                let newFighterIds;
                if (checked) {
                    newFighterIds = [...prev.fighter_ids, fighterId];
                } else {
                    newFighterIds = prev.fighter_ids.filter(id => id !== fighterId);
                }
                console.log('Fighter IDs actualizados:', newFighterIds); // Para debug
                return { ...prev, fighter_ids: newFighterIds };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "El campo nombre es obligatorio";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return setError('Por favor, corrige los errores en el formulario');

        setIsLoading(true);
        setError(null);

        const formPayload = new FormData();
        const fieldsToExclude = ['poster_url', 'event_id', 'fighter_ids'];

        // Agregar campos básicos
        for (const key in formData) {
            if (fieldsToExclude.includes(key)) continue;
            formPayload.append(key, formData[key]);
        }

        // IMPORTANTE: Agregar fighter_ids correctamente
        // Opción 1: Si tu backend espera un array JSON
        formPayload.append('fighter_ids', JSON.stringify(formData.fighter_ids));
        
        // Opción 2: Si tu backend espera múltiples campos con el mismo nombre
        // formData.fighter_ids.forEach(id => {
        //     formPayload.append('fighter_ids', id);
        // });

        // Agregar imagen si existe
        if (imageFile) {
            formPayload.append('poster', imageFile);
        } else if (isEditMode && !formData.poster_url) {
            formPayload.append('poster_url', '');
        }

        // Debug: Ver qué se está enviando
        console.log('Datos a enviar:');
        for (let [key, value] of formPayload.entries()) {
            console.log(key, value);
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
        } catch (err) {
            console.error('Error completo:', err.response?.data);
            const msg = err.response?.data?.message || 'Error desconocido al guardar el evento';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Poster del evento</label>
                        <input
                            type="file"
                            name="poster"
                            accept="image/*"
                            onChange={e => {
                                const file = e.target.files[0];
                                setImageFile(file);
                                if (file) setFormData(prev => ({ ...prev, poster_url: URL.createObjectURL(file) }));
                            }}
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        />
                        {formData.poster_url && (
                            <div className="mt-3">
                                <img
                                    src={imageFile ? formData.poster_url : `http://localhost:3001/${formData.poster_url}`}
                                    alt={`imagen de ${formData.name || 'evento'}`}
                                    className="h-40 w-40 object-cover rounded-lg border border-gray-300 shadow-md"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona luchadores ({formData.fighter_ids.length} seleccionados)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-2 rounded bg-gray-50">
                            {fighters.map(f => (
                                <label 
                                    key={f.fighter_id} 
                                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer
                                        ${formData.fighter_ids.includes(f.fighter_id) ? 'bg-blue-100 font-semibold' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        value={f.fighter_id}
                                        checked={formData.fighter_ids.includes(f.fighter_id)}
                                        onChange={handleChange}
                                        className="h-4 w-4"
                                    />
                                    <span>{f.first_name} {f.last_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Evento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;