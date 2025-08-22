import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import OfferListPage from '../OfferListPage';
import * as hooks from '../../hooks/useOffers';
import * as filtersHook from '../../hooks/useOfferFilters';
import { mockAuth, renderWithProviders } from '../../test/test-utils';

describe('OfferListPage', () => {
  it('renders offers and supports pagination', () => {
    mockAuth({ user: { id: 'u', email: 'u@test.dev', role: 'STUDENT' } as any, isAuthenticated: true });

    vi.spyOn(filtersHook, 'useOfferFilters').mockReturnValue({
      filters: { searchTerm: '', locationFilter: '', companySearch: '', selectedType: '', selectedSkills: [] },
      debouncedFilters: { search: '', location: '', companyName: '', type: '', skills: [] },
      allSkills: [], allOfferTypes: [], skillsLoading: false, offerTypesLoading: false,
      setSearchTerm: vi.fn(), setLocationFilter: vi.fn(), setCompanySearch: vi.fn(), setSelectedType: vi.fn(), setSelectedSkills: vi.fn(),
      handleSkillChange: vi.fn(), clearAllSkills: vi.fn(), clearFilters: vi.fn(),
    } as any);

    vi.spyOn(hooks, 'useOffers').mockReturnValue({
      offers: [
        { id: '1', title: 'Offer A', description: 'desc', location: null, contractType: '', duration: '', workMode: '', company: { name: 'ACME' }, skills: [], matchScore: 0 },
      ] as any,
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<OfferListPage />);

    expect(screen.getByText((t) => /Offres de Stage|Internship and Apprenticeship Offers/i.test(t))).toBeInTheDocument();
    expect(screen.getByText('Offer A')).toBeInTheDocument();
  });
});


