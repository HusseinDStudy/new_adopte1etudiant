import React from 'react';
import { describe, it, expect } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import DashboardRedirect from '../DashboardRedirect';
import { mockAuth, renderWithProviders } from '../../../test/test-utils';

describe('DashboardRedirect', () => {
  it('redirects guest to login', () => {
    mockAuth({ isAuthenticated: false, user: null });
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/login" element={<div>login</div>} />
      </Routes>,
      { route: '/' }
    );
    expect(document.body.textContent).toMatch(/login/i);
  });

  it('redirects student to student dashboard', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'STUDENT' } });
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/dashboard-student" element={<div>student</div>} />
      </Routes>,
      { route: '/' }
    );
    expect(document.body.textContent).toMatch(/student/i);
  });

  it('redirects company to company dashboard', () => {
    mockAuth({ isAuthenticated: true, user: { id: '1', role: 'COMPANY' } });
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/dashboard-company" element={<div>company</div>} />
      </Routes>,
      { route: '/' }
    );
    expect(document.body.textContent).toMatch(/company/i);
  });
});


