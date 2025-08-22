import React from 'react';
import { describe, it, expect } from 'vitest';
import { Routes, Route, Navigate, MemoryRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import GuestRoute from '../GuestRoute';
import RoleBasedRoute from '../RoleBasedRoute';
import { mockAuth, renderWithProviders } from '../../../test/test-utils';

const Dummy = ({ text }: { text: string }) => <div>{text}</div>;

describe('Route guards', () => {
  it('ProtectedRoute redirects when not authenticated', () => {
    mockAuth({ user: null, isAuthenticated: false, loading: false });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}> 
          <Route path="/private" element={<Dummy text="private" />} />
        </Route>
        <Route path="/login" element={<Dummy text="login" />} />
      </Routes>,
      { route: '/private' }
    );
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('GuestRoute redirects when authenticated', () => {
    mockAuth({ user: { id: '1', email: 'a', role: 'STUDENT' } as any, isAuthenticated: true, loading: false });
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<GuestRoute><Dummy text="login" /></GuestRoute>} />
        <Route path="/" element={<Dummy text="home" />} />
      </Routes>,
      { route: '/login' }
    );
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('RoleBasedRoute allows allowed role and redirects otherwise', () => {
    // Allowed: ADMIN stays on page
    mockAuth({ user: { id: '1', email: 'a', role: 'ADMIN' } as any, isAuthenticated: true });
    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<RoleBasedRoute allowedRole="ADMIN"><Dummy text="admin" /></RoleBasedRoute>} />
        <Route path="/admin/dashboard" element={<Dummy text="adminDash" />} />
      </Routes>,
      { route: '/admin' }
    );
    expect(screen.getByText('admin')).toBeInTheDocument();

    // Not allowed: STUDENT redirected to student dashboard
    mockAuth({ user: { id: '2', email: 'b', role: 'STUDENT' } as any, isAuthenticated: true });
    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<RoleBasedRoute allowedRole="ADMIN"><Dummy text="admin" /></RoleBasedRoute>} />
        <Route path="/dashboard-student" element={<Dummy text="studentDash" />} />
      </Routes>,
      { route: '/admin' }
    );
    expect(screen.getByText('studentDash')).toBeInTheDocument();
  });
});


