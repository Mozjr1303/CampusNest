import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(fullPath)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user?.role || (user?.email === 'admin@campusnest.mw' ? 'admin' : 'student');
    if (!allowedRoles.includes(currentRole)) {
      if (currentRole === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      if (currentRole === 'landlord') {
        return <Navigate to="/landlord/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
