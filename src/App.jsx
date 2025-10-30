import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FighterList from './components/FighterList.jsx';
import Login from './components/Login.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from './components/Layout.jsx';
import { CompanyList } from './components/CompanyList.jsx';
import { EventList } from './components/EventList.jsx';
import { AdminFighters } from './admin/AdminFighters.jsx';

const HomePage = () => (
  <div className="text-center mt-20">
    <h1 className="text-4xl font-extrabold bg-gradient-to-b from-custom-red to-custom-gold bg-clip-text text-transparent rounded-md">Bienvenido al Catálogo de MMA EN Español</h1>
    <p className="text-xl bg-gradient-to-b from-custom-red to-custom-gold bg-clip-text text-transparent rounded-md">últimas noticias</p>
  </div>
);

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

          <Route path="*" element={
            <div className='bg-gradient-to-b from-custom-red to-custom-gold rounded-xl w-auto h-auto mt-14 
            sm:w-3/4 sm:ml-24'>
              <h1 className="text-center mt-5 text-3xl flex justify-center items-center ">
                404 - Página no encontrada
              </h1>
            </div>} />

          {/* RUTAS DE ADMIN */}
          <Route path="/admin/fighters" element={
            <ProtectedRoute requiredRole="admin">
              <AdminFighters />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <h1 className="text-center mt-20 text-3xl font-bold text-red-600">
                ¡PANEL DE ADMINISTRACIÓN!
              </h1>
            </ProtectedRoute>
          } />



        </Route>
      </Routes>
    </Router>
  );
}

export default App;