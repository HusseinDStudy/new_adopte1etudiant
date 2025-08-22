import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import { renderWithProviders } from '../../../test/test-utils';

describe('LanguageSwitcher', () => {
  it('toggles language label between FR and EN', async () => {
    renderWithProviders(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    // Initial language may be detected from environment; assert it flips
    const initialText = button.textContent;
    fireEvent.click(button);
    expect(button.textContent).not.toBe(initialText);
  });
});


