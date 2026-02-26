import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import avatar from "/images/fighters/avatar.png";
import { Helmet } from "react-helmet-async";

const FighterDetail = () => {
  const { slug } = useParams();
  const [fighter, setFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFighter = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/fighters/slug/${slug}`);

        if (!response.ok) throw new Error("Peleador no encontrado");
        const data = await response.json();
        setFighter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFighter();
  }, [slug]);

  const getImageUrl = (photoUrl) => {
    if (photoUrl && (photoUrl.startsWith("http") || photoUrl.startsWith("https"))) {
      return photoUrl;
    }
    return `${BACKEND_URL}/${photoUrl}`;
  };

  // PELEAS RECIENTES
  const renderFights = (fightsText) => {
    if (!fightsText) {
      return (
        <p className="italic text-gray-500">
          No hay historial reciente.</p>);
    }
    // Esta línea limpia espacios vacíos y entiende cualquier tipo de salto de línea (\n o \r)
    const lines = fightsText.split(/\r?\n/).filter(line => line.trim() !== "");

    return lines.map((line, index) => {
      const isWin = line.toLowerCase().includes('victoria');
      const isLoss = line.toLowerCase().includes('derrota');

      return (
        <div
          key={index}
          className={`flex justify-between p-3 mb-2 rounded-lg shadow-sm ${isWin ? 'bg-green-600' :
            isLoss ? 'bg-red-600' : 'bg-gray-500'
            }`}
        >
          <span className="font-bold">{line}</span>
        </div>
      );
    });
  };

  
  if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando...</p>;
  if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;
  if (!fighter) return <p>No se encontró al peleador.</p>;

  //  Nombre con apodo si existe para el SEO
  const fullName = fighter.nickname
    ? `${fighter.first_name} "${fighter.nickname}" ${fighter.last_name}`
    : `${fighter.first_name} ${fighter.last_name}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HELMET PARA EL SEO */}
      <Helmet>
        <title>{`${fullName} | Récord y Perfil MMA | Spanish MMA`}</title>
        <meta
          name="description"
          content={`Perfil de ${fullName}. Récord: ${fighter.record_wins}-${fighter.record_losses}.
           Equipo: ${fighter.team || 'Independiente'}. Descubre su biografía y últimos
            combates en la base de datos de MMA en España.`}
        />
        <meta property="og:title" content={`${fullName} - Spanish MMA`} />
        <meta property="og:description" content={`Estadísticas y resultados de ${fullName} en MMA.`} />
        <meta property="og:image" content={fighter.photo_url ? getImageUrl(fighter.photo_url) : avatar} />
      </Helmet>

      {/* CABECERA PARA VOLVER */}
      <Link to="/peleadores" className="gradiant-color streetFighterTypo hover:underline mb-4 
      inline-block font-semibold hover:scale-105 transition duration-300 cursor-pointer text-3xl">
        ← VOLVER A PELEADORES
      </Link>

      <div className="bg-gray-200 bg-opacity-70 p-8 rounded-xl shadow-lg text-center border-l-2
      border-l-custom-red border-b-2 border-b-custom-gold">
        <h2 className="text-3xl font-bold mb-6 text-custom-black">
          {fullName}
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={fighter.photo_url ? getImageUrl(fighter.photo_url) : avatar}
            alt={`Foto de ${fighter.first_name}`}
            className="w-48 h-48 object-cover rounded-full shadow-lg border-2 border-custom-black"
          />
        </div>

        <div className="text-lg space-y-2 text-gray-800">
          <p>
            <strong>Peso:</strong> {fighter.weight_class || "No especificado"}
          </p>
          <p>
            <strong>Compañía:</strong> {fighter.company_name || "Libre"}
          </p>
          <p>
            <strong>Récord:</strong>{" "}
            {fighter.record_wins}-{fighter.record_losses}-{fighter.record_draws}
          </p>
          <p>
            <strong>Ciudad:</strong>{" "}
            {fighter.city}
          </p>
          <p>
            <strong>Equipo:</strong>{" "}
            {fighter.team}
          </p>
        </div>

        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {/* RÉCORD EN COLORES */}
          <span className="bg-green-600 text-white px-1 md:px-3 py-1 rounded-lg md:rounded-full font-bold">
            {fighter.record_wins} Victorias
          </span>
          <span className="bg-red-600 text-white px-1 md:px-3 py-1 rounded-lg md:rounded-full font-bold">
            {fighter.record_losses} Derrotas
          </span>
          <span className="bg-gray-500 text-white px-1 md:px-3 py-1 rounded-lg md:rounded-full font-bold">
            {fighter.record_draws} Empates
          </span>
        </div>

        {/* BIOGRAFÍA */}
        <div className="md:col-span-2 space-y-6 text-left mt-10">
          <div className="bg-white bg-opacity-50 p-4 rounded-lg italic text-gray-700">
            <h3 className="font-bold not-italic mb-2 border-b border-gray-300">
              Biografía
            </h3>
            <p className="whitespace-pre-wrap">
              {fighter.bio || "Más información, muy pronto"}
            </p>
          </div>
        </div>

        {/* HISTORIAL DE COMBATES  */}
        <div className="mt-10 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center font-sans text-custom-red">
            ÚLTIMOS COMBATES
          </h3>
          <div className="grid grid-cols-1 gap-2 text-left">
            {renderFights(fighter.recent_fights)}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FighterDetail;
