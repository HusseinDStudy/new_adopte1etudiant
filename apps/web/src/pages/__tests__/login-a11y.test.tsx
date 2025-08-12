import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import LoginPage from '../LoginPage';
import { MemoryRouter } from 'react-router-dom';


describe('LoginPage a11y', () => {
  it('has no obvious a11y violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});


