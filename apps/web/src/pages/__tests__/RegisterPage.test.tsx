import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterPage from '../RegisterPage';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { A11yProvider } from '../../theme/A11yProvider';

describe('RegisterPage', () => {
  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <A11yProvider>
            <RegisterPage />
          </A11yProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });
});
