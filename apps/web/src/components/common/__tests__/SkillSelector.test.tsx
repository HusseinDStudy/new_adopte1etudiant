import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import SkillSelector from '../SkillSelector';
import { renderWithProviders } from '../../../test/test-utils';

describe('SkillSelector', () => {
  const skills = [
    { id: '1', name: 'React' },
    { id: '2', name: 'TypeScript' },
  ];

  it('opens dropdown and filters, toggles selection', () => {
    const onSkillChange = vi.fn();
    const onClearAll = vi.fn();
    renderWithProviders(
      <SkillSelector
        skills={skills as any}
        selectedSkills={[]}
        onSkillChange={onSkillChange}
        onClearAll={onClearAll}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText(/Rechercher une compétence/i), { target: { value: 'React' } });
    fireEvent.click(screen.getByText('React'));
    expect(onSkillChange).toHaveBeenCalledWith('React');
  });
});


