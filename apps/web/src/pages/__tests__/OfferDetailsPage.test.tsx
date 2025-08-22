import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import * as offerService from '../../services/offerService';
import * as AuthContext from '../../context/AuthContext';
import OfferDetailsPage from '../OfferDetailsPage';
import { renderWithProviders } from '../../test/test-utils';

describe('OfferDetailsPage', () => {
  it('renders details and apply button for student', async () => {
    vi.spyOn(offerService, 'getOfferById').mockResolvedValueOnce({
      id: 'o1',
      title: 'Frontend Intern',
      description: 'Build UI',
      location: 'Paris',
      duration: '3 months',
      company: { name: 'ACME' },
      skills: ['React'],
      matchScore: 90,
    } as any);
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u', email: 'a', role: 'STUDENT' } as any,
      loading: false,
      isAuthenticated: true,
      loginWithCredentials: vi.fn(),
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    } as any);

    renderWithProviders(
      <Routes>
        <Route path="/offers/:id" element={<OfferDetailsPage />} />
      </Routes>,
      { route: '/offers/o1' }
    );

    expect(await screen.findByText('Frontend Intern')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply now|Postuler maintenant/i })).toBeInTheDocument();
  });
});


