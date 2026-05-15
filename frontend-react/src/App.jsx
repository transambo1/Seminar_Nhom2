import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { MapProvider } from './context/MapContext';
import { APIProvider } from '@vis.gl/react-google-maps';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import { RequestSupport } from './pages/support/SupportForms';
import MySupports from './pages/support/MyRequests';
import Notifications from './pages/dashboard/Notifications';
import { AdminSupportManagement } from './pages/admin/AdminPages';
import WeatherMonitoring from './pages/admin/WeatherMonitoring';
import IncidentReport from './pages/incident/IncidentReport';
import ShelterList from './pages/shelter/ShelterList';
import IncidentList from './pages/incident/IncidentList';
import Profile from './pages/auth/Profile';

function App() {
  return (
    <BrowserRouter>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <MapProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/support/create" element={<ProtectedRoute><RequestSupport /></ProtectedRoute>} />
            <Route path="/incident/report" element={<ProtectedRoute><IncidentReport /></ProtectedRoute>} />
            <Route path="/request-list" element={<ProtectedRoute><MySupports /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/shelters" element={<ProtectedRoute><ShelterList /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><IncidentList /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            <Route path="/admin/supports" element={<ProtectedRoute adminOnly><AdminSupportManagement /></ProtectedRoute>} />
            <Route path="/admin/weather" element={<ProtectedRoute adminOnly><WeatherMonitoring /></ProtectedRoute>} />
          </Routes>
        </MapProvider>
      </APIProvider>
    </BrowserRouter>
  );
}
export default App;
