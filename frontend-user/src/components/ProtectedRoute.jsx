import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

export default function ProtectedRoute({ children }) {
  const { token } = useStateContext();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
