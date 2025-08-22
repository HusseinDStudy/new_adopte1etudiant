import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// Avoid exporting AuthContext types from this util to keep ts build simple
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as AuthContext from '../context/AuthContext';
import '../i18n/index';

type RenderOptions = {
  route?: string;
  withRouter?: boolean;
};

export const renderWithProviders: (
  ui: React.ReactElement,
  options?: { route?: string; withRouter?: boolean }
) => RenderResult = (
  ui: React.ReactElement,
  { route = '/', withRouter = true }: RenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route);
  const tree = (
    <HelmetProvider>
        {withRouter ? (
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        ) : (
          ui
        )}
    </HelmetProvider>
  );
  return render(tree);
};

export const mockAuth = (overrides: any) => {
  return (vi.spyOn(AuthContext as any, 'useAuth') as any).mockReturnValue({
    user: null,
    loading: false,
    isAuthenticated: false,
    loginWithCredentials: vi.fn(),
    setCurrentUser: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    ...(overrides as any),
  });
};


