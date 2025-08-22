import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import LoginPage from '../LoginPage';
import * as authService from '../../services/authService';
import { mockAuth, renderWithProviders } from '../../test/test-utils';

describe('LoginPage', () => {
  it('submits credentials and shows 2FA step if required', async () => {
    const setCurrentUser = vi.fn();
    mockAuth({ setCurrentUser });
    vi.spyOn(authService, 'login').mockResolvedValueOnce({ twoFactorRequired: true } as any);

    renderWithProviders(<LoginPage />);

    const email = screen.getByLabelText(/Adresse email|Email address/i);
    const password = screen.getByLabelText(/Mot de passe|Password/i);
    fireEvent.change(email, { target: { value: 'user@test.dev' } });
    fireEvent.change(password, { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter|Sign in/i }));

    // 2FA form shows (accept either FR or EN)
    expect(
      await screen.findByText((t) => /Authentification à deux facteurs|Two-Factor Authentication/i.test(t))
    ).toBeInTheDocument();
  });
});


