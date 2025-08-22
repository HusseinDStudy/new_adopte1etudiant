import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import StudentCard from '../StudentCard';
import { renderWithProviders } from '../../../test/test-utils';

const student = {
  id: 's1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  school: 'Uni',
  degree: 'CS',
  skills: ['React', 'TS', 'Node', 'CSS', 'HTML', 'GraphQL', 'Jest'],
  cvUrl: 'https://example.com/cv.pdf',
  isCvPublic: true,
  availability: 'Available',
  location: 'Paris',
};

describe('StudentCard', () => {
  it('renders info and toggles request form', () => {
    renderWithProviders(<StudentCard student={student as any} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Uni')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
    // More skills indicator (accept FR/EN variants)
    expect(screen.getByText((t) => /\+1\s+(autres|others|more)/i.test(t))).toBeInTheDocument();
  });

  it('opens request form and validates message length', async () => {
    const onRequestAdoption = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <StudentCard student={student as any} onRequestAdoption={onRequestAdoption} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Demander une adoption|Request adoption/i }));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'too short' } });
    expect(screen.getByRole('button', { name: /Envoyer la demande|Send request/i })).toBeDisabled();
    fireEvent.change(textarea, { target: { value: 'This is a valid message.' } });
    fireEvent.click(screen.getByRole('button', { name: /Envoyer la demande|Send request/i }));
    expect(onRequestAdoption).toHaveBeenCalled();
  });
});


