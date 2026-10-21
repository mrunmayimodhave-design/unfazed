import React from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import UpgradeModal from './components/common/UpgradeModal';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const { upgradeModalOpen, closeUpgradeModal, upgradeModalData } = useAuth();
  const location = useLocation();

  // Hide therapist header navbar on public branded page if preferred, or keep unified
  const isPublicPortal = location.pathname.startsWith('/portal');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* Global Upgrade Trigger Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={closeUpgradeModal}
        data={upgradeModalData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Unfazed Therapy OS</span>
            <span>• Built for Indian Healthcare & Private Practice</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/dr-ananya-roy" className="hover:text-teal-600 transition">
              Demo Branded Link
            </Link>
            <Link to="/login" className="hover:text-teal-600 transition">
              Therapist Login
            </Link>
            <Link to="/dashboard" className="hover:text-teal-600 transition">
              Practice Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
