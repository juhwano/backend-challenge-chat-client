// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userName = localStorage.getItem('userName');
  if (!userName) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
