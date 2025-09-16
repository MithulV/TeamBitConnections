import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/AuthStore';

const PrivateRoute = () => {
  const { token } = useAuthStore();

  // If there's a token, render the child routes, otherwise redirect to login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;