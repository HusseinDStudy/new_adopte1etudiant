import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../../App';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { A11yProvider } from '../../theme/A11yProvider';
// Mock AuthContext to bypass loading state
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false }),
  AuthProvider: ({ children }: any) => children,
}));

describe('Routing and landmarks', () => {
  it('has a single main landmark with id main-content and skip link targets it', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider>
          <A11yProvider>
            <App />
          </A11yProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    const skip = screen.getByText(/skip to main content/i);
    expect(skip).toHaveAttribute('href', '#main-content');
  });
});


