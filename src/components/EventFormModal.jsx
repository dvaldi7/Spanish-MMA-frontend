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
    description: '',
};

const EventFormModal = ({ eventIdToEdit, isModalOpen, closeModal, onEventSaved }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [fighters, setFighters] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const isEditMode = !!eventIdToEdit;

    useEffect(() => {
        if (!isModalOpen) {
            setFormData(initialFormState);
            setError(null);
            setImageFile(null);
            return;
        }

        const fetchEventData = async () => {
            if (!isEditMode) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/events/id/${eventIdToEdit}`);
                const eventData = response.data.event;

                const fightersResponse = await api.get(`/events/id/${eventIdToEdit}/fighters`);
                const assignedFighters = fightersResponse.data.roster || [];
                const fighterIds = assignedFighters.map(f => f.fighter_id);

                setFormData({
                    name: eventData.name || '',
                    location: eventData.location || '',
                    date: eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '',
                    event_id: eventData.event_id || null,
                    poster_url: eventData.poster_url || '',
                    is_completed: String(eventData.is_completed || false),
                    fighter_ids: fighterIds,
                    description: eventData.description || '',
                });
            } catch (err) {
                console.error('Error:', err);
                setError("Error al cargar datos");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEventData();
    }, [isModalOpen, eventIdToEdit, isEditMode]);

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
            } catch (err) { console.error(err); }
        };
        fetchAllFighters();
    }, [isModalOpen]);

    const handleChange = e => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setImageFile(files[0]);
        } else if (type === 'checkbox') {
            const fighterId = parseInt(value);
            setFormData(prev => ({
                ...prev,
                fighter_ids: checked
                    ? [...prev.fighter_ids, fighterId]
                    : prev.fighter_ids.filter(id => id !== fighterId)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    //Para enviar datos en las fotos
    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        // contenedor de datos
        const formPayload = new FormData();

        // datos de texto uno a uno
        formPayload.append('name', formData.name);
        formPayload.append('location', formData.location);
        formPayload.append('date', formData.date);
        formPayload.append('description', formData.description);
        formPayload.append('is_completed', formData.is_completed);
        formPayload.append('fighter_ids', JSON.stringify(formData.fighter_ids));

        if (imageFile) {
            formPayload.append('poster', imageFile);
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (isEditMode) {
                await api.put(`/events/id/${eventIdToEdit}`, formPayload, config);
            } else {
                await api.post('/events', formPayload, config);
            }

            onEventSaved();
            closeModal();
        } catch (err) {
            console.error('Error:', err.response?.data);
            setError('Error al guardar: revisa que la columna description existe en la BBDD');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight">
                        {isEditMode ? 'Editar Evento' : 'Nuevo Evento'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-black"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500">
                            Nombre del Evento
                        </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            required className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            placeholder="Ej: PFL Madrid" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500">
                                Fecha
                            </label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500">
                                Ubicación
                            </label>
                            <input type="text" name="location" value={formData.location}
                                onChange={handleChange} className="mt-1 block w-full border
                             border-gray-300 rounded p-2 text-sm" placeholder="Madrid, España" />
                        </div>
                    </div>

                    {/* IMAGEN DEL PÓSTER */}
                    <div className="border-t pt-4">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                            Póster del Evento
                        </label>

                        <div className="flex items-center space-x-4">
                            {/* Previsualización */}
                            <div className="h-16 w-16 bg-gray-100 rounded border overflow-hidden 
                            flex-shrink-0">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)}
                                        className="h-full w-full object-cover"
                                        alt="Preview" />
                                ) : formData.poster_url ? (
                                    <img src={formData.poster_url.startsWith('http') ?
                                        formData.poster_url : `http://localhost:3001/${formData.poster_url}`}
                                        className="h-full w-full object-cover" alt="Actual" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center
                                                     text-gray-400 text-[10px] text-center p-1">
                                        Sin foto
                                    </div>
                                )}
                            </div>

                            {/* Input de archivo */}
                            <input
                                type="file"
                                name="poster"
                                accept="image/*"
                                onChange={handleChange}
                                className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full 
            file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white
             hover:file:bg-gray-800 cursor-pointer w-full"
                            />
                        </div>
                    </div>

                    {/* CARTELERA */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-red-600">
                            Cartelera Completa
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm 
                            font-mono"
                            placeholder="Ilia Topuria VS Joel Álvarez&#10;Hecher Sosa VS Anderson Silva"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">
                            * Escribe cada combate en una línea nueva.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500">
                            Peleadores Españoles Participantes
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 
                        rounded bg-gray-50 mt-1">
                            {fighters.map(f => (
                                <label key={f.fighter_id} className="flex items-center space-x-2 text-xs
                                 p-1 hover:bg-gray-100 cursor-pointer">
                                    <input type="checkbox" value={f.fighter_id} checked={formData.fighter_ids.includes(f.fighter_id)} onChange={handleChange} />
                                    <span className={formData.fighter_ids.includes(f.fighter_id) ? "font-bold" : ""}>{f.first_name} {f.last_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-3 rounded font-bold uppercase hover:bg-gray-800 disabled:bg-gray-400">
                        {isLoading ? 'Guardando...' : 'Guardar Evento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;