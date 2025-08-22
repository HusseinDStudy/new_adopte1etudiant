import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/Enter text/i)).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText(/Enter text/i);
    fireEvent.change(inputElement, { target: { value: 'Hello World' } });
    expect(inputElement).toHaveValue('Hello World');
  });
});
