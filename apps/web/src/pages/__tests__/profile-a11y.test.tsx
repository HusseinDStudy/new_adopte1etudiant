import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import ProfilePage from '../ProfilePage';

// Mock AuthContext to avoid real network calls in tests
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'test@example.com', role: 'STUDENT' }, isAuthenticated: true, logout: () => {} }),
  AuthProvider: ({ children }: any) => children,
}));
// Mock i18n instance to silence init warnings
vi.mock('../../i18n/index.ts', () => ({}));
import { MemoryRouter } from 'react-router-dom';

describe('ProfilePage a11y', () => {
  it('has no obvious a11y violations in student profile form layout', async () => {
    // Mock profileService.getProfile to avoid network
    vi.mock('../../services/profileService', () => ({
      getProfile: async () => ({ firstName: 'Test', lastName: 'User', skills: [] }),
      upsertProfile: async (data: any) => data,
    }));
    const { container } = render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const main = screen.getByRole('main');
    const results = await axe(main);
    expect(results.violations).toEqual([]);
  });
});

