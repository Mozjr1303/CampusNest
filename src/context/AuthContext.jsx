/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  // Saved listings persisted in localStorage
  const [savedListingIds, setSavedListingIds] = useState(() => {
    try {
      const stored = localStorage.getItem('campusnest_saved_listings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('campusnest_saved_listings', JSON.stringify(savedListingIds));
    } catch (e) {
      console.error('Failed to persist saved listings', e);
    }
  }, [savedListingIds]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setToken(response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential = null) => {
    setLoading(true);
    try {
      const response = await authService.loginWithGoogle(credential);
      setUser(response.user);
      setToken(response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const toggleSaveListing = (id) => {
    setSavedListingIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isListingSaved = (id) => savedListingIds.includes(id);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    savedListingIds,
    toggleSaveListing,
    isListingSaved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
