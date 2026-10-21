import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Therapist Pages
import Dashboard from '../pages/therapist/Dashboard';
import Clients from '../pages/therapist/Clients';
import Schedule from '../pages/therapist/Schedule';
import Notes from '../pages/therapist/Notes';
import Analytics from '../pages/therapist/Analytics';

// Client Pages
import BookingPage from '../pages/client/BookingPage';
import ClientPortal from '../pages/client/ClientPortal';
import PaymentPage from '../pages/client/Payment';
import TherapistDirectoryPage from '../pages/client/TherapistDirectoryPage';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Loader from '../components/common/Loader';

import LandingPage from '../pages/LandingPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader text="Verifying clinical authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader text="Starting Unfazed..." />;
  }

  return (
    <Routes>
      {/* Root shows Platform Landing Page, or redirects to therapist dashboard if logged in */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Therapist Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Public Client Experience Routes */}
      <Route path="/therapists" element={<TherapistDirectoryPage />} />
      <Route path="/portal/:clientId" element={<ClientPortal />} />
      <Route path="/payment" element={<PaymentPage />} />

      {/* Branded public link /:slug (e.g. /dr-ananya-roy) */}
      <Route path="/:slug" element={<BookingPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
