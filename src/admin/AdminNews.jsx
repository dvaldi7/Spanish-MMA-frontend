import React, { useState } from 'react';
import useFetchNews from '../hooks/useFetchNews';
import api from '../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const AdminNews = () => {
    const { news, pagination, loading, goToPage, fetchNews } = useFetchNews(10);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Manejar cambios en texto
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Manejar subida de imagen
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    // Función para cargar datos en el formulario
    const startEdit = (item) => {
        setEditingId(item.news_id);
        setFormData({ title: item.title, content: item.content });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', content: '' });
        setImage(null);
    };

    // CREAR O EDITAR NOTICIA
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (image) data.append('image', image);

        try {
            if (editingId) {
                // EDITAR
                await api.put(`/news/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Noticia actualizada con éxito");
            } else {
                // CREAR
                await api.post('/news', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Noticia creada con éxito");
            }

            cancelEdit();
            fetchNews();
        } catch (err) {
            console.error("Error en la operación:", err);
            alert(err.response?.data?.message || "Error en el servidor");
        }
    };

    // BORRAR NOTICIA
    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres borrar esta noticia?")) return;

        try {
            await api.delete(`/news/${id}`);
            alert("Noticia eliminada correctamente");
            fetchNews();
        } catch (err) {
            console.error("Error al borrar:", err);
            alert(err.response?.data?.message || "Error al eliminar");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto mt-10 font-sans">

            <h1 className="text-3xl font-bold mb-8 border-b-2 border-custom-red pb-2 gradiant-color">
                {editingId ? 'Editando Noticia' : 'Panel de Noticias'}
            </h1>

            {/* FORMULARIO DE CREACIÓN */}
            <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-md mb-10 grid grid-cols-1 gap-4 ${editingId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100'}`}>
                <input type="text" name="title" placeholder="Título" value={formData.title} onChange={handleChange} required className="p-2 border rounded" />
                <textarea name="content" placeholder="Contenido..." value={formData.content} onChange={handleChange} required className="p-2 border rounded h-32" />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-600">Imagen (dejar vacío para mantener la actual si editas)</label>
                    <input type="file" onChange={handleImageChange} className="p-2" />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className={`flex-1 p-2 rounded font-bold text-white ${editingId ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {editingId ? 'Guardar Cambios' : 'Publicar Noticia'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-red-600 text-white p-2 rounded font-bold">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {/* TABLA DE GESTIÓN */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white shadow-lg rounded-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-4">Imagen</th>
                            <th className="p-4">Título</th>
                            <th className="p-4 hidden md:table-cell">Fecha</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map(item => (
                            <tr key={item.news_id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <img
                                        src={item.image_url
                                            ? (item.image_url.startsWith('http') ? item.image_url : `${BACKEND_URL}/${item.image_url}`)
                                            : '/images/Error404.jpg'}
                                        className="w-12 h-10 md:w-16 md:h-12 object-cover rounded shadow-sm"
                                        alt="Noticia"
                                    />
                                </td>
                                {/* El título se verá más pequeño en móvil para ahorrar espacio */}
                                <td className="p-2 md:p-4 font-semibold text-sm md:text-base">
                                    {item.title}
                                </td>
                                {/* Ocultamos la celda de la fecha en móvil */}
                                <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                                    {new Date(item.published_at).toLocaleDateString()}
                                </td>
                                <td className="p-2 md:p-4">
                                    <div className="flex flex-col md:flex-row justify-center gap-2">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="bg-green-600 text-white px-2 py-1 md:px-3 md:py-1 rounded 
                                text-xs md:text-sm hover:bg-green-800 transition"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.news_id)}
                                            className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded 
                                text-xs md:text-sm hover:bg-red-700 transition"
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};