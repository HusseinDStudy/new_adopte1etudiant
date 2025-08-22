import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';
import { renderWithProviders } from '../../../test/test-utils';

describe('Pagination', () => {
  it('renders current range and buttons', () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
        itemsPerPage={10}
        totalItems={42}
      />
    );

    // Accept either FR or EN rendering depending on test env language detection
    expect(
      screen.getByText((t) => /Affichage de|Showing/i.test(t))
    ).toBeInTheDocument();
    expect(
      screen.getByTitle((t) => /Première page|First page/i.test(t))
    ).toBeInTheDocument();
    expect(
      screen.getByTitle((t) => /Dernière page|Last page/i.test(t))
    ).toBeInTheDocument();
  });

  it('invokes onPageChange when clicking page buttons', () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
        itemsPerPage={9}
        totalItems={27}
      />
    );

    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});


