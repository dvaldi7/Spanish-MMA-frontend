import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
import avatar from "/images/companies/avatar.jpg";

const CompanyDetail = () => {
  const { slug } = useParams(); 
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/companies/slug/${slug}`);
        if (!response.ok) throw new Error("Compañía no encontrada");
        const data = await response.json();
        setCompany(data.company); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  const getLogoUrl = (logoUrl) => {
    if (logoUrl && (logoUrl.startsWith("http") || logoUrl.startsWith("https"))) {
      return logoUrl;
    }
    return `${BACKEND_URL}/${logoUrl}`;
  };

  if (loading) return <p className="text-center text-xl p-6 text-blue-600">Cargando compañía...</p>;
  if (error) return <p className="text-center text-red-600 text-xl p-6">{error}</p>;
  if (!company) return <p>No se encontró la compañía.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link 
        to="/promotoras" 
        className="gradiant-color streetFighterTypo hover:underline mb-4 
        inline-block font-semibold hover:scale-105 transition duration-300 cursor-pointer text-3xl"
      >
        ← VOLVER A PROMOTORAS
      </Link>

      <div className="bg-gray-200 bg-opacity-70 p-8 rounded-xl shadow-lg text-center border-l-2
      border-l-custom-red border-b-2 border-b-custom-gold">
        <h2 className="text-3xl font-bold mb-6 text-custom-black">{company.name}</h2>

        <div className="flex justify-center mb-6">
          <img
            src={company.logo_url ? getLogoUrl(company.logo_url) : avatar}
            alt={`Logo de ${company.name}`}
            className="w-48 h-48 object-fill rounded-full shadow-lg border-2 border-custom-black"
          />
        </div>

        <div className="text-lg space-y-2 text-gray-800">
          <p>
            <strong>País:</strong> {company.country || "No disponible"}
          </p>
          <p>
            <strong>Ciudad / Sede:</strong> {company.headquarters || "No disponible"}
          </p>
          <p>
            <strong>Web:</strong>{" "}
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.website}
              </a>
            ) : (
              "No disponible"
            )}
          </p>
        </div>

        <div className="text-lg space-y-2 text-gray-800 mt-10">
          <h2>Más información próximamente</h2>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
