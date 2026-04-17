import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import { ReportHazard, RequestSupport } from './pages/Forms';
import MySupports from './pages/MySupports';
import Notifications from './pages/Notifications';
import { AdminReportReview, AdminSupportManagement } from './pages/AdminPages';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/report-hazard" element={<ProtectedRoute><ReportHazard /></ProtectedRoute>} />
        <Route path="/request-support" element={<ProtectedRoute><RequestSupport /></ProtectedRoute>} />
        <Route path="/my-supports" element={<ProtectedRoute><MySupports /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReportReview /></ProtectedRoute>} />
        <Route path="/admin/supports" element={<ProtectedRoute adminOnly><AdminSupportManagement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
