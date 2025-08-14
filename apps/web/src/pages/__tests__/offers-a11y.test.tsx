import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import OfferListPage from '../OfferListPage';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { A11yProvider } from '../../theme/A11yProvider';
// Mock i18n to silence warnings
vi.mock('../../i18n/index.ts', () => ({}));

describe('OfferListPage a11y', () => {
  it('has no a11y violations in main', async () => {
    vi.mock('../../hooks/useOfferFilters', () => ({
      useOfferFilters: () => ({
        filters: {
          searchTerm: '', locationFilter: '', companySearch: '', selectedType: '', selectedSkills: []
        },
        debouncedFilters: {
          search: '', location: '', companyName: '', type: '', skills: []
        },
        allSkills: [], allOfferTypes: [],
        skillsLoading: false, offerTypesLoading: false,
        setSearchTerm: () => {}, setLocationFilter: () => {}, setCompanySearch: () => {}, setSelectedType: () => {}, handleSkillChange: () => {}, clearAllSkills: () => {}, clearFilters: () => {},
      })
    }));
    vi.mock('../../hooks/useOffers', () => ({
      useOffers: () => ({ offers: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 9 }, loading: false, error: null, refetch: () => {} })
    }));
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <A11yProvider>
            <OfferListPage />
          </A11yProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});


