import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth');
  return isAuthenticated ? <Navigate to="/schools" /> : children;
};

export default PublicRoute;