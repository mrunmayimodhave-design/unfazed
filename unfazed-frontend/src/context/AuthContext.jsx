import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [therapist, setTherapist] = useState(() => {
    const saved = localStorage.getItem('unfazed_therapist');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('unfazed_token') || null);
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upgrade modal global state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState(null);

  const fetchProfileAndEntitlement = async () => {
    if (!localStorage.getItem('unfazed_token')) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data.success) {
        setTherapist(res.data.therapist);
        setEntitlement(res.data.entitlement);
        localStorage.setItem('unfazed_therapist', JSON.stringify(res.data.therapist));
      }
    } catch (err) {
      console.warn('Failed to fetch auth session:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndEntitlement();
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, therapist: newTherapist, entitlement: newEntitlement } = res.data;
      localStorage.setItem('unfazed_token', newToken);
      localStorage.setItem('unfazed_therapist', JSON.stringify(newTherapist));
      setToken(newToken);
      setTherapist(newTherapist);
      setEntitlement(newEntitlement);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (data) => {
    const res = await axiosInstance.post('/auth/register', data);
    if (res.data.success) {
      const { token: newToken, therapist: newTherapist, entitlement: newEntitlement } = res.data;
      localStorage.setItem('unfazed_token', newToken);
      localStorage.setItem('unfazed_therapist', JSON.stringify(newTherapist));
      setToken(newToken);
      setTherapist(newTherapist);
      setEntitlement(newEntitlement);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('unfazed_token');
    localStorage.removeItem('unfazed_therapist');
    setToken(null);
    setTherapist(null);
    setEntitlement(null);
  };

  const refreshEntitlement = async () => {
    try {
      const res = await axiosInstance.get('/therapist/subscription');
      if (res.data.success) {
        setEntitlement(res.data.subscription);
      }
    } catch (err) {
      console.error('Failed to refresh entitlement:', err);
    }
  };

  const openUpgradeModal = (data = {}) => {
    setUpgradeModalData(data);
    setUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setUpgradeModalOpen(false);
    setUpgradeModalData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        token,
        entitlement,
        loading,
        login,
        register,
        logout,
        refreshEntitlement,
        setTherapist,
        upgradeModalOpen,
        upgradeModalData,
        openUpgradeModal,
        closeUpgradeModal,
        isAuthenticated: !!token && !!therapist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
