import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'STUDENT' | 'COMPANY' | 'ADMIN';
  allowedRoles?: ('STUDENT' | 'COMPANY' | 'ADMIN')[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRole, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine if user has access
  const hasAccess = allowedRole 
    ? user?.role === allowedRole
    : allowedRoles 
    ? allowedRoles.includes(user?.role as any)
    : false;

  // If user role doesn't match allowed role(s), redirect to their appropriate dashboard
  if (!hasAccess) {
    let redirectPath = '/';
    switch (user?.role) {
      case 'STUDENT':
        redirectPath = '/dashboard-student';
        break;
      case 'COMPANY':
        redirectPath = '/dashboard-company';
        break;
      case 'ADMIN':
        redirectPath = '/admin/dashboard';
        break;
      default:
        redirectPath = '/';
    }
    return <Navigate to={redirectPath} replace />;
  }

  // If role matches, render the component
  return <>{children}</>;
};

export default RoleBasedRoute;
