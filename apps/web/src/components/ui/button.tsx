import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:brightness-110 focus-visible:ring-[color:var(--color-primary)]',
  secondary: 'bg-[color:var(--color-secondary)] text-black hover:brightness-110 focus-visible:ring-[color:var(--color-secondary)]',
  outline: 'border border-neutral-200 text-neutral-900 hover:bg-neutral-50 focus-visible:ring-[color:var(--color-primary)]',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 focus-visible:ring-[color:var(--color-primary)]'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const classes = [base, variantClasses[variant], sizeClasses[size], className].join(' ').trim();
    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = 'Button';

export default Button;


