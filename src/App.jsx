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
import { Error404 } from './components/404.jsx';
import { HomePage } from './components/HomePage.jsx';
import { NewsDetail } from './components/NewsDetail.jsx';


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
          <Route path="/news/:slug" element={<NewsDetail />} />

          <Route path="*" element={<Error404 />} />

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