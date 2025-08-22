import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import LoginPage from '../LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { A11yProvider } from '../../theme/A11yProvider';

describe('LoginPage a11y', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <A11yProvider>
            <LoginPage />
          </A11yProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});


