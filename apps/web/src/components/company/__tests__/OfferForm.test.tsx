import React, { ReactNode, createContext, useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import OfferForm from '../OfferForm';
import { renderWithProviders } from '../../../test/test-utils';
import * as ReactHookForm from 'react-hook-form';

// Mock react-hook-form's useForm hook directly
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

// Mocks for useId and FieldContext for Field and Label components
let mockUseIdValue = 0;
const MockFieldContext = createContext<any>(null);

vi.mock('react', async (importActual) => {
  const actual = await importActual<typeof React>();
  return {
    ...actual,
    useId: () => `mock-id-${++mockUseIdValue}`,
  };
});

vi.mock('../../form/Field', async (importActual) => {
  const actual = await importActual<typeof import('../../form/Field')>();
  const useMockField = () => useContext(MockFieldContext);

  return {
    ...actual,
    Field: ({ children, error, helpText }: any) => {
      const id = `mock-field-id-${++mockUseIdValue}`;
      const errorId = error ? `${id}-error` : undefined;
      const helpId = helpText ? `${id}-help` : undefined;

      return (
        <MockFieldContext.Provider value={{ id, errorId, helpId }}>
          <div>
            {typeof children === 'function' ? children({ id, errorId, helpId }) : children}
            {helpText && <p id={helpId} className="mt-1 text-sm text-neutral-700">{helpText}</p>}
            {error && <p id={errorId} className="mt-1 text-sm text-error" role="alert">{error}</p>}
          </div>
        </MockFieldContext.Provider>
      );
    },
    Label: ({ children, className, htmlFor: propHtmlFor, ...rest }: any) => {
      const { id } = useMockField();
      const finalHtmlFor = propHtmlFor || id;
      return (
        <label htmlFor={finalHtmlFor} className={className} {...rest}>
          {children}
        </label>
      );
    },
    useField: useMockField,
  };
});



// Explicitly mock the Input component from ui/input
vi.mock('../ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(function Input({ id, className, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy, ...props }, ref) {
    return <input id={id} className={className} aria-invalid={ariaInvalid} aria-describedby={ariaDescribedBy} {...props} ref={ref} />;
  }),
}));

describe('OfferForm', () => {
  const useForm = ReactHookForm.useForm as ReturnType<typeof vi.fn>;

  let formValues: Record<string, any>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIdValue = 0; // Reset for each test to ensure unique IDs per test

    formValues = {
      title: '',
      description: '',
      skills: '',
      location: '',
      duration: '',
      salary: '',
    };

    useForm.mockReturnValue({
      register: vi.fn((name) => ({
        name,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          formValues = { ...formValues, [name]: e.target.value };
        },
        onBlur: vi.fn(),
        ref: vi.fn(),
      })),
      handleSubmit: vi.fn((callback) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        callback(formValues);
      }),
      formState: { errors: {} },
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setValue: vi.fn((name, value) => {
        formValues = { ...formValues, [name]: value };
      }),
      getValues: vi.fn(() => formValues),
    });
  });

  it('submits transformed skills on valid data', async () => {
    const onSubmit = vi.fn();

    renderWithProviders(<OfferForm onSubmit={onSubmit} isSubmitting={false} />);

    // Now, fireEvent.change should correctly update formValues
    fireEvent.change(screen.getByLabelText(/Titre|Title/i), { target: { value: 'Frontend Intern' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Build user interface' } });
    fireEvent.change(screen.getByLabelText(/Compétences|Skills/i), { target: { value: 'React, TypeScript' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer l'offre|Save offer/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const call = (onSubmit as any).mock.calls[0][0];
    expect(call.title).toBe('Frontend Intern');
    expect(call.description).toBe('Build user interface');
    expect(call.skills).toEqual(['React', 'TypeScript']);
  });
});


