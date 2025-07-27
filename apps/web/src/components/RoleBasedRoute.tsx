import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRole: 'STUDENT' | 'COMPANY';
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user role doesn't match allowed role, redirect to their appropriate dashboard
  if (user?.role !== allowedRole) {
    const redirectPath = user?.role === 'STUDENT' ? '/dashboard-student' : '/dashboard-company';
    return <Navigate to={redirectPath} replace />;
  }

  // If role matches, render the component
  return <>{children}</>;
};

export default RoleBasedRoute;
