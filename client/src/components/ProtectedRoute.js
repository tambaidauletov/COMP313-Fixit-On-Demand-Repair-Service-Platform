import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'client') {
      return <Navigate to="/dashboard" />;
    } else if (user.role === 'provider') {
      return <Navigate to="/provider/dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 