import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../test/test-utils';
import AboutPage from '../AboutPage';
import PrivacyPage from '../PrivacyPage';
import TermsPage from '../TermsPage';
import ContactPage from '../ContactPage';
import RGPDPage from '../RGPDPage';
import MentionsLegalesPage from '../MentionsLegalesPage';

describe('Static pages smoke', () => {
  it('renders AboutPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/about" element={<AboutPage />} />
      </Routes>,
      { route: '/about' }
    );
    expect(screen.getAllByText(/Notre mission|Our Mission/i).length).toBeGreaterThan(0);
  });

  it('renders PrivacyPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>,
      { route: '/privacy' }
    );
    // multiple headings exist; assert presence by count
    expect(screen.getAllByRole('heading', { level: 1, name: /privacy|confidentialité/i }).length).toBeGreaterThan(0);
  });

  it('renders TermsPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
      </Routes>,
      { route: '/terms' }
    );
    // two H1s (hero + sr-only) exist; just assert presence of one by text
    expect(screen.getAllByRole('heading', { level: 1, name: /terms of service|conditions/i }).length).toBeGreaterThan(0);
  });

  it('renders ContactPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/contact" element={<ContactPage />} />
      </Routes>,
      { route: '/contact' }
    );
    expect(screen.getByRole('heading', { level: 1, name: /contact/i })).toBeInTheDocument();
  });

  it('renders RGPDPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/rgpd" element={<RGPDPage />} />
      </Routes>,
      { route: '/rgpd' }
    );
    expect(screen.getAllByRole('heading', { level: 1, name: /general data protection regulation|rgpd|données|privacy/i }).length).toBeGreaterThan(0);
  });

  it('renders MentionsLegalesPage', () => {
    renderWithProviders(
      <Routes>
        <Route path="/mentions" element={<MentionsLegalesPage />} />
      </Routes>,
      { route: '/mentions' }
    );
    expect(screen.getAllByRole('heading', { level: 1, name: /mentions|legal/i }).length).toBeGreaterThan(0);
  });
});


