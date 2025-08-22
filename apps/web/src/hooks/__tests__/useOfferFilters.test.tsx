import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as skillService from '../../services/skillService';
import * as offerService from '../../services/offerService';
import { useOfferFilters } from '../useOfferFilters';

// do not auto-mock modules; we will spy on named exports

describe('useOfferFilters', () => {
  it('loads skills and offer types, updates filters', async () => {
    vi.spyOn(skillService, 'getAllSkills').mockResolvedValueOnce([{ id: 's1', name: 'React' }] as any);
    vi.spyOn(offerService, 'getOfferTypes').mockResolvedValueOnce(['INTERNSHIP'] as any);

    const { result } = renderHook(() => useOfferFilters());

    await waitFor(() => expect(result.current.skillsLoading).toBe(false));
    await waitFor(() => expect(result.current.offerTypesLoading).toBe(false));
    expect(result.current.allSkills[0].name).toBe('React');
    expect(result.current.allOfferTypes[0]).toBe('INTERNSHIP');

    act(() => {
      result.current.setSearchTerm('frontend');
      result.current.handleSkillChange('React');
    });
    expect(result.current.filters.searchTerm).toBe('frontend');
    expect(result.current.filters.selectedSkills).toContain('React');
  });
});


