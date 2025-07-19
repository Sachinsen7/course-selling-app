import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AUTH_ROUTES } from '../routes'; 

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-inter text-gray-700">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

 
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.warn(`Access denied for role: ${user?.role}. Required roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />;
  }

 
  return children;
};

export default PrivateRoute;
