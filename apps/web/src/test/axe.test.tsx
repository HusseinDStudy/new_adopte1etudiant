import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

// type-only: jest-axe matcher types not needed at build time

describe('Accessibility smoke tests', () => {
  it('App renders without basic a11y violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});


