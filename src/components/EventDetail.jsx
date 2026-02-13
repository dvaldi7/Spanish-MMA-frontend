import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import avatar from "/images/events/avatar.jpg";
import fightersAvatar from "/images/fighters/avatar.png";

const EventDetail = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventAndRoster = async () => {
      try {

        const responseEvent = await fetch(`${BACKEND_URL}/api/events/slug/${slug}`);
        if (!responseEvent.ok) throw new Error("Evento no encontrado");

        const dataEvent = await responseEvent.json();
        setEvent(dataEvent.event);

        const eventId = dataEvent.event.event_id;

        const responseRoster = await fetch(`${BACKEND_URL}/api/events/id/${eventId}/fighters`);
        if (!responseRoster.ok) throw new Error("No se pudieron obtener los peleadores del evento");

        const dataRoster = await responseRoster.json();
        setFighters(dataRoster.roster || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndRoster();
  }, [slug]);

  //Obtener la foto de los peleadores y si no el avatar de peleadores
  const getFighterPhotoUrl = (photoUrl) => {
    if (photoUrl && (photoUrl.startsWith("http") || photoUrl.startsWith("https"))) {
      return photoUrl;
    }
    return photoUrl ? `${BACKEND_URL}/${photoUrl}` : fightersAvatar;
  };

  //Obtener la imagen del poster
  const getPosterUrl = (posterUrl) => {
    if (posterUrl && (posterUrl.startsWith("http") || posterUrl.startsWith("https"))) {
      return posterUrl;
    }
    return posterUrl ? `${BACKEND_URL}/${posterUrl}` : null;
  };

  // Fecha estilo de españa
  const formatDateSpanish = (dateString) => {
    if (!dateString) return "No disponible";

    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' 
    };

    return date.toLocaleDateString('es-ES', options);
  };

  //Evento completado o no
  const isEventCompleted = (dateString) => {
    if (!dateString) return false;

    const eventDate = new Date(dateString);

    // Fecha de hoy
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return eventDate < today;
  };

  // busca si el peleador existe en tu DB para la cartelera
  const renderBout = (line, index) => {
  if (!line.trim()) return null;

  // Dividimos la línea por "VS" (o "vs") para separar a los dos contendientes
  const parts = line.split(/\s+VS\s+/i);
  
  // Función interna para buscar la foto de un peleador por su nombre
  const findFighterPhoto = (namePart) => {
    const found = fighters.find(f => 
      namePart.toLowerCase().includes(f.first_name.toLowerCase()) || 
      namePart.toLowerCase().includes(f.last_name.toLowerCase())
    );
    return found ? getFighterPhotoUrl(found.photo_url) : fightersAvatar;
  };

  return (
    <div key={index} className="bg-white bg-opacity-40 p-3 rounded-lg shadow-sm border border-gray-300 mb-2">
      <div className="flex items-center justify-between px-4">
        
        {/* PELEADOR 1 (Izquierda) */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-sm font-bold text-gray-700 text-right">{parts[0]}</span>
          <img 
            src={findFighterPhoto(parts[0] || "")} 
            className="h-10 w-10 rounded-full border-2 border-custom-red object-cover shadow-sm"
            alt="Fighter"
          />
        </div>

        {/* SEPARADOR VS */}
        <div className="mx-4 font-black italic text-custom-red">VS</div>

        {/* PELEADOR 2 (Derecha) */}
        <div className="flex items-center gap-3 flex-1">
          <img 
            src={findFighterPhoto(parts[1] || "")} 
            className="h-10 w-10 rounded-full border-2 border-custom-red object-cover shadow-sm"
            alt="Fighter"
          />
          <span className="text-sm font-bold text-gray-700">{parts[1]}</span>
        </div>

      </div>
    </div>
  );
};


  if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando evento...</p>;
  if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;
  if (!event) return <p>No se encontró el evento.</p>;

  // Determinar el estado 'Completado'
  const completedStatus = event.is_completed || isEventCompleted(event.date);

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

        {/* Poster del evento */}
          <div className="flex justify-center mb-6 ">
            <img
              src={event.poster_url ? getPosterUrl(event.poster_url) : avatar}
              alt={`Poster de ${event.name}`}
              className="w-48 h-48 object-fill rounded-full shadow-lg border-2 border-custom-black"
            />
          </div>
        

        <div className="text-lg space-y-2 text-gray-800">
          <p><strong>Ubicación:</strong> {event.location || "No disponible"}</p>
          <p><strong>Fecha:</strong> {formatDateSpanish(event.date)}</p>
          <p>
            <strong>Completado:</strong> {completedStatus ? "Sí" : "No"}
          </p>
        </div>

        {/* CARTELERA  */}
      {event.description && (
        <div className="mb-12 mt-10">
          <h2 className="text-4xl font-bold gradiant-color streetFighterTypo mb-8 text-center uppercase">
            Cartelera
          </h2>
          <div className="space-y-4">
            {event.description.split('\n').map((line, idx) => renderBout(line, idx))}
          </div>
        </div>
      )}
      </div>

      

      {/* PELEADORES DEL EVENTO */}
      {fighters.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-4xl font-bold gradiant-color streetFighterTypo mb-6 text-center">
            Peleadores del evento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {fighters.map((fighter) => (
              <Link
                to={`/peleadores/${fighter.slug}`}
                key={fighter.fighter_id}
                className="bg-gray-200 bg-opacity-70 p-4 rounded-xl shadow-md hover:shadow-xl 
                hover:scale-105 transition duration-300 flex flex-col items-center text-center border-l-2
               border-l-custom-red border-b-2 border-b-custom-gold"
              >
                <img
                  src={getFighterPhotoUrl(fighter.photo_url)}
                  alt={fighter.nickname || fighter.first_name}
                  className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-custom-black"
                />
                <p className="text-lg font-semibold text-custom-black">

                  {fighter.first_name} {fighter.nickname ? `"${fighter.nickname}" ` : ""} {fighter.last_name}

                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 text-center">
          <h2 className="text-4xl font-bold gradiant-color streetFighterTypo mb-6">
            Peleadores del evento
          </h2>
          <p className="text-black">Aún no hay peleadores asignados a este evento</p>
        </div>
      )}
    </div>
  );
};

export default EventDetail;