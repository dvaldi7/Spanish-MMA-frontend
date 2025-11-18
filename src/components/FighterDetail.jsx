import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import avatar from "/images/fighters/avatar.png";

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

  if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando...</p>;
  if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;
  if (!fighter) return <p>No se encontró al peleador.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/peleadores" className="gradiant-color streetFighterTypo hover:underline mb-4 
      inline-block font-semibold hover:scale-105 transition duration-300 cursor-pointer text-3xl">
        ← VOLVER A PELEADORES
      </Link>

      <div className="bg-gray-200 bg-opacity-70 p-8 rounded-xl shadow-lg text-center border-l-2
      border-l-custom-red border-b-2 border-b-custom-gold">
        <h2 className="text-3xl font-bold mb-6 text-custom-black">
          {fighter.nickname
            ? `${fighter.first_name} "${fighter.nickname}" ${fighter.last_name}`
            : `${fighter.first_name} ${fighter.last_name}`}
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
        </div>
        <div className="text-lg space-y-2 text-gray-800 mt-10">
            <h2>Más información muy pronto</h2>
        </div>
      </div>
    </div>
  );
};

export default FighterDetail;
