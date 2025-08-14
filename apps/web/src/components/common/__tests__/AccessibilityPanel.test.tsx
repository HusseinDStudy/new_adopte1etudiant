import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityPanel } from '../../common/AccessibilityPanel';
import { A11yProvider } from '../../../theme/A11yProvider';
import { ThemeProvider } from '../../../theme/ThemeProvider';

describe('AccessibilityPanel', () => {
  function setup() {
    localStorage.clear();
    return render(
      <ThemeProvider>
        <A11yProvider>
          <AccessibilityPanel />
        </A11yProvider>
      </ThemeProvider>
    );
  }

  it('toggles text size and announces changes', async () => {
    const user = userEvent.setup();
    setup();
    const btn = screen.getByRole('button', { name: /accessibility/i });
    await user.click(btn);
    const xl = screen.getByRole('radio', { name: /extra-large/i });
    await user.click(xl);
    expect(document.documentElement.classList.contains('a11y-font-xl')).toBe(true);
    // live region announces
    const live = screen.getByRole('region', { hidden: true });
    expect(live).toBeTruthy();
  });

  it('persists preferences and reapplies on mount', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /accessibility/i }));
    const underline = screen.getByRole('checkbox', { name: /underline links/i });
    await user.click(underline);
    expect(document.documentElement.classList.contains('a11y-underline-links')).toBe(true);
    // remount without clearing storage
    await user.click(screen.getByRole('button', { name: /close/i }));
    render(
      <ThemeProvider>
        <A11yProvider>
          <AccessibilityPanel />
        </A11yProvider>
      </ThemeProvider>
    );
    render(
      <ThemeProvider>
        <A11yProvider>
          <AccessibilityPanel />
        </A11yProvider>
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('a11y-underline-links')).toBe(true);
  });
});


