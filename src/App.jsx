import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FighterList from './components/FighterList.jsx'; 
import Login from './components/Login.jsx'; 
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Header } from './components/Header.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-200">
        
        {/* HEADER */}
        <Header />

        {/* MAIN */}
        <main className="container mx-auto p-4">  
          <Routes>
           
            <Route path="/peleadores" element={<FighterList />} />   
            <Route path="/login" element={<Login />} />
            <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <h1 className="text-center mt-20 text-3xl font-bold text-red-600">
                    ¡ACCESO DE ADMIN CONCEDIDO!
                  </h1>
                </ProtectedRoute>
              } />
            <Route path="*" element={<h1 className="text-center mt-20 text-3xl">404 - Página no encontrada</h1>} />
            
          </Routes>
        </main>

            {/* FOOTER */}
      
      </div>
    </Router>
  );
}

export default App;