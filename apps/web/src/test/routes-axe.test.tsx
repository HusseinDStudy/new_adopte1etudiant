import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import * as AuthContext from '../context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import '../i18n/index';
import { A11yProvider } from '../theme/A11yProvider';

// type-only: jest-axe matcher types not needed at build time

// Polyfills for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Default auth stub to avoid the global loader during a11y checks
beforeEach(() => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: null,
    loading: false,
    isAuthenticated: false,
    loginWithCredentials: vi.fn(),
    setCurrentUser: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
  } as any);
});

const checkPath = async (path: string, axeOptions?: any) => {
  const { container } = render(
    <HelmetProvider>
      <A11yProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </A11yProvider>
    </HelmetProvider>
  );
  const results = await axe(container, axeOptions);
  expect(results).toHaveNoViolations();
};

describe('A11y route smoke checks', () => {
  it('Home', async () => await checkPath('/'));
  it('Offers list', async () => await checkPath('/offers'));
  it('Students', async () => await checkPath('/students'));
  it('Blog', async () => await checkPath('/blog'));
  it('Verify2faPage', async () => await checkPath('/verify-2fa'));
  it('Privacy', async () => await checkPath('/privacy'));
  it('Terms', async () => await checkPath('/terms'));
  it('RGPD', async () => await checkPath('/rgpd'));
  it('Mentions légales', async () => await checkPath('/mentions-legales'));
  it('Accessibilite', async () => await checkPath('/accessibilite'));
  it('Dashboard (mocked auth)', async () => {
    // Mock AuthContext to simulate an authenticated STUDENT
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT' },
      loading: false,
      isAuthenticated: true,
      loginWithCredentials: vi.fn(),
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    } as any);
    await checkPath('/dashboard-student', {
      rules: {
        'heading-order': { enabled: false },
        'landmark-main-is-top-level': { enabled: false },
        'landmark-no-duplicate-main': { enabled: false },
        'landmark-unique': { enabled: false },
      },
    });
  });
});


