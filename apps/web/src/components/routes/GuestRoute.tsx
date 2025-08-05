import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestRoute component that redirects authenticated users away from guest-only pages
 * (like login and register). This prevents logged-in users from accessing these pages.
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect them away from guest pages
  if (isAuthenticated) {
    // Try to redirect to the intended destination from state, or use default
    const from = (location.state as any)?.from?.pathname || redirectTo;

    // Show a brief message before redirecting (optional - you can remove this if you prefer instant redirect)
    if (location.pathname === '/login' || location.pathname === '/register') {
      // For a smoother UX, we could show a brief "Already logged in, redirecting..." message
      // But for now, we'll do an instant redirect
      return <Navigate to={from} replace />;
    }

    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the guest page (login/register)
  return <>{children}</>;
};

export default GuestRoute;
