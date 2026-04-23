import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DoctorsPage from './pages/DoctorsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';

// ── Route Guards ───────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// ── Root redirect: sends doctor to /doctor/appointments, patient to /dashboard
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'doctor'
    ? <Navigate to="/doctor/appointments" replace />
    : <Navigate to="/dashboard" replace />;
};

// ── App Routes ─────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Patient routes */}
      <Route path="/dashboard"    element={<ProtectedRoute role="patient"><DashboardPage /></ProtectedRoute>} />
      <Route path="/doctors"      element={<ProtectedRoute role="patient"><DoctorsPage /></ProtectedRoute>} />
      <Route path="/book"         element={<ProtectedRoute role="patient"><BookAppointmentPage /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute role="patient"><AppointmentsPage /></ProtectedRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorDashboardPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
