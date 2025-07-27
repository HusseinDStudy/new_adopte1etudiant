import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on user role
  const dashboardPath = user?.role === 'STUDENT' ? '/dashboard-student' : '/dashboard-company';
  
  return <Navigate to={dashboardPath} replace />;
};

export default DashboardRedirect;
