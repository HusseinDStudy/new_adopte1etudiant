import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  uiSize?: 'sm' | 'md' | 'lg';
}

const base = 'block w-full rounded-md border border-neutral-200 bg-white shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)] text-neutral-900 placeholder-neutral-500';
const sizes = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-3 px-4 text-sm',
  lg: 'py-3.5 px-4 text-base'
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', uiSize = 'md', ...props }, ref) => {
    const classes = [base, sizes[uiSize], className].join(' ').trim();
    return <input ref={ref} className={classes} {...props} />;
  }
);
Input.displayName = 'Input';

export default Input;


