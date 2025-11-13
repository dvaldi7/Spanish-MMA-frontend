import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import avatar from "/images/events/avatar.jpg";

const EventDetail = () => {
  const { slug } = useParams(); 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/events/slug/${slug}`);
        if (!response.ok) throw new Error("Evento no encontrado");
        const data = await response.json();
        setEvent(data.event); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const getPosterUrl = (posterUrl) => {
    if (posterUrl && (posterUrl.startsWith("http") || posterUrl.startsWith("https"))) {
      return posterUrl;
    }
    return `${BACKEND_URL}/${posterUrl}`;
  };

  if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando evento...</p>;
  if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;
  if (!event) return <p>No se encontró el evento.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link 
        to="/eventos" 
        className="gradiant-color streetFighterTypo hover:underline mb-4 
        inline-block font-semibold hover:scale-105 transition duration-300 cursor-pointer text-3xl"
      >
        ← VOLVER A EVENTOS
      </Link>

      <div className="bg-gray-200 bg-opacity-70 p-8 rounded-xl shadow-lg text-center border-l-2
      border-l-custom-red border-b-2 border-b-custom-gold">
        <h2 className="text-3xl font-bold mb-6 text-custom-black">{event.name}</h2>

        <div className="flex justify-center mb-6">
          <img
            src={event.poster_url ? getPosterUrl(event.poster_url) : avatar}
            alt={`Poster de ${event.name}`}
            className="w-48 h-48 object-fill rounded-xl shadow-lg border-2 border-custom-black"
          />
        </div>

        <div className="text-lg space-y-2 text-gray-800">
          <p>
            <strong>Localización:</strong> {event.location || "No disponible"}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {event.date
              ? new Date(event.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "No disponible"}
          </p>
        </div>

        <div className="text-lg space-y-2 text-gray-800 mt-10">
          <h2>Más información próximamente</h2>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
