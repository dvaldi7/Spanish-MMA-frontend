import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FighterList from './components/FighterList.jsx';
import Login from './components/Login.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from './components/Layout.jsx';

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

              <Route index element={<HomePage />} />
              <Route path="/peleadores" element={<FighterList />} />
              <Route path="/login" element={<Login />} />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <h1 className="text-center mt-20 text-3xl font-bold text-red-600">
                    ¡PANEL DE ADMINISTRACIÓN!
                  </h1>
                </ProtectedRoute>
              } />

              <Route path="*" element={<div className='bg-custom-black rounded-xl w-auto h-auto mt-14 sm:w-3/4 sm:ml-24'>
                                          <h1 className="text-center mt-5 text-3xl flex justify-center 
                                          items-center bg-gradient-to-b from-custom-red to-custom-gold 
                                          bg-clip-text text-transparent font-extrabold">
                                            404 - Página no encontrada
                                          </h1>
                                      </div>} />

            </Route>
          </Routes>
    </Router>
  );
}

export default App;