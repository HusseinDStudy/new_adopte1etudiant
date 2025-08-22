import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import OfferCard from '../OfferCard';
import { mockAuth, renderWithProviders } from '../../../test/test-utils';

const baseOffer = {
  id: 'o1',
  title: 'Frontend Intern',
  company: { name: 'ACME' },
  location: 'Paris',
  skills: ['React', 'TypeScript', 'Node.js', 'CSS', 'HTML'],
  type: 'Stage',
  duration: '3 months',
  description: 'Build UI',
};

describe('OfferCard', () => {
  it('renders offer details and skills', () => {
    mockAuth({ user: { role: 'STUDENT' }, isAuthenticated: true });
    renderWithProviders(
      <OfferCard offer={{ ...baseOffer, matchScore: 82 }} userRole="STUDENT" />
    );
    expect(screen.getByText('Frontend Intern')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText((t) => /\+1 autres|\+1\s+others/i.test(t))).toBeInTheDocument();
    expect(screen.getByText(/82%/)).toBeInTheDocument();
  });

  it('triggers apply when student clicks', () => {
    const onApply = vi.fn();
    mockAuth({ user: { role: 'STUDENT' }, isAuthenticated: true });
    renderWithProviders(
      <OfferCard offer={baseOffer as any} userRole="STUDENT" onApply={onApply} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Postuler|Apply/i }));
    expect(onApply).toHaveBeenCalledWith('o1');
  });
});


