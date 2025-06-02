import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
