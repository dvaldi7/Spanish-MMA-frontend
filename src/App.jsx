import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FighterList from './components/FighterList.jsx';
import Login from './components/Login.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from './components/Layout.jsx';
import { CompanyList } from './components/CompanyList.jsx';
import { EventList } from './components/EventList.jsx';
import AdminFighters from './admin/AdminFighters.jsx';
import { AdminCompanies } from './admin/AdminCompanies.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminEvents from './admin/AdminEvents.jsx';
import FighterDetail from './components/FighterDetail.jsx';
import CompanyDetail from './components/CompanyDetail.jsx';
import EventDetail from './components/EventDetail.jsx';
import { useNavigate } from 'react-router-dom';



const HomePage = () => {

  const navigate = useNavigate();
  
  return (
  <main className="text-center mt-16 p-4 max-w-4xl mx-auto">
    {/* Título Principal */}
    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
      <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent ">
        El Catálogo definitivo de MMA en Español
      </span>
    </h1>

    {/* Subtítulo */}
    <h2 className="text-xl md:text-2xl bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text 
        text-transparent font-medium mb-8">
      Explora la comunidad española de las Artes Marciales Mixtas
    </h2>

    {/* Descripción  */}
    <section className="bg-gray-200 opacity-65 p-6 md:p-10 rounded-xl shadow-lg border
     border-gray-100 space-y-4 text-left  border-l-custom-red border-b-2  border-b-custom-gold
     hover:shadow-2xl hover:scale-105 transition duration-500 cursor-pointer">
      <p className="text-lg text-gray-800">
        Bienvenido a la plataforma centralizada para la información de MMA en España.
        Nuestra misión es conectar a los fans con el corazón de la acción,
        ofreciendo datos actualizados sobre el circuito de Artes Marciales Mixtas en España y de nuestros
        principales peleadores a lo largo y ancho del mundo.
      </p>
      <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
        <li>
          <strong className="bg-gradient-to-r from-red-600 to-amber-500 
                bg-clip-text text-transparent">
            Peleadores:
          </strong>
          Accede a perfiles detallados, historiales y estadísticas de los mejores luchadores de la escena hispana.
        </li>
        <li>
          <strong className="bg-gradient-to-r from-red-600 to-amber-500
                 bg-clip-text text-transparent">
            Promotoras:
          </strong>
          Descubre las organizaciones que están impulsando el deporte, sus eventos futuros y su historia.
        </li>
        <li>
          <strong className="bg-gradient-to-r from-red-600 to-amber-500 
                bg-clip-text text-transparent">
            Eventos:
          </strong> Mantente al día con el calendario de los próximos combates y revisa los resultados de los
          eventos pasados.
        </li>
      </ul>
    </section>

    {/* Botón */}
    <div className="mt-10">
      <button
        onClick={() => navigate("/peleadores")}
        className="inline-block px-10 py-4 text-lg font-bold text-black
bg-gradient-to-r from-red-600 to-amber-500 
                            rounded-full shadow-lg hover:bg-blue-700 
                           transition duration-300 transform hover:scale-105"
      >
        It's time!
      </button>
    </div>
  </main>

  )
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* RUTAS PÚBLICAS */}
          <Route index element={<HomePage />} />
          <Route path="/peleadores" element={<FighterList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/promotoras" element={<CompanyList />} />
          <Route path="/eventos" element={<EventList />} />
          <Route path="/peleadores/:slug" element={<FighterDetail />} />
          <Route path="/promotoras/:slug" element={<CompanyDetail />} />
          <Route path="/eventos/:slug" element={<EventDetail />} />

          <Route path="*" element={
            <div className='bg-gradient-to-b from-custom-red to-custom-gold rounded-xl w-auto h-auto mt-14 
            sm:w-3/4 sm:ml-24'>
              <h1 className="text-center mt-5 text-3xl flex justify-center items-center ">
                404 - Página no encontrada
              </h1>
            </div>} />

          {/* RUTAS DE ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* RUTAS HIJAS dentro del AdminLayout */}
            <Route index element={<AdminFighters />} />
            <Route path="fighters" element={<AdminFighters />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="events" element={<AdminEvents />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;