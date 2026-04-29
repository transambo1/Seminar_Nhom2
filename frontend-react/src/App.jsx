import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import { RequestSupport } from './pages/support/SupportForms';
import MySupports from './pages/support/MyRequests';
import Notifications from './pages/dashboard/Notifications';
import { AdminSupportManagement } from './pages/admin/AdminPages';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/request-support" element={<ProtectedRoute><RequestSupport /></ProtectedRoute>} />
        <Route path="/request-list" element={<ProtectedRoute><MySupports /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/admin/supports" element={<ProtectedRoute adminOnly><AdminSupportManagement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
