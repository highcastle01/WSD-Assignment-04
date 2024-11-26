import { Navigate } from 'react-router-dom';
import React from 'react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  return isLoggedIn ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;