import React, { createContext, useContext, ReactNode, useId } from 'react';

interface FieldContextType {
  id: string;
  errorId?: string;
  helpId?: string;
}

const FieldContext = createContext<FieldContextType | null>(null);

export const useField = () => {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error('Field subcomponents must be used within a Field');
  return ctx;
};

interface FieldProps {
  children: ReactNode | ((ctx: FieldContextType) => ReactNode);
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
        {typeof children === 'function' ? (children({ id, errorId, helpId })) : children}
        {helpText && (
          <p id={helpId} className="mt-1 text-sm text-neutral-700">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
};

export const Label: React.FC<{ children: ReactNode; className?: string } & React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...rest }) => {
  const { id } = useField();
  return (
    <label htmlFor={id} className={className} {...rest}>
      {children}
    </label>
  );
};


