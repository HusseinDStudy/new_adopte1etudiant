import React from 'react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  uiSize?: 'sm' | 'md' | 'lg';
}

const base = 'block w-full rounded-md border border-neutral-200 bg-white shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)] text-neutral-900';
const sizes = {
  sm: 'py-2 pl-3 pr-10 text-sm',
  md: 'py-3 pl-3 pr-10 text-sm',
  lg: 'py-3.5 pl-4 pr-10 text-base'
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', uiSize = 'md', children, ...props }, ref) => {
  const classes = [base, sizes[uiSize], className].join(' ').trim();
  return (
    <select ref={ref} className={classes} {...props}>
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export default Select;


