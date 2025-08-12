import React, { createContext, useContext, ReactNode, useId } from 'react';

interface FieldContextType {
  id: string;
  errorId?: string;
  helpId?: string;
}

const FieldContext = createContext<FieldContextType | null>(null);

interface FieldProps {
  children: ReactNode;
  error?: string;
  helpText?: string;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ children, error, helpText, className }) => {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <FieldContext.Provider value={{ id, errorId, helpId }}>
      <div className={className}>
        {children}
        {helpText && <HelpText id={helpId!}>{helpText}</HelpText>}
        {error && <ErrorText id={errorId!}>{error}</ErrorText>}
      </div>
    </FieldContext.Provider>
  );
};

export const useField = () => {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error('Field subcomponents must be used within a Field');
  return ctx;
};

export const Label: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { id } = useField();
  return (
    <label htmlFor={id} className={className}>
      {children}
    </label>
  );
};

export const HelpText: React.FC<{ id: string; children: ReactNode }> = ({ id, children }) => {
  return (
    <p id={id} className="text-sm text-neutral-700 mt-1">
      {children}
    </p>
  );
};

export const ErrorText: React.FC<{ id: string; children: ReactNode }> = ({ id, children }) => {
  return (
    <p id={id} className="text-sm text-error mt-1">
      {children}
    </p>
  );
};



