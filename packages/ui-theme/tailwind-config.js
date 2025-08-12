/** Shared Tailwind config that maps CSS variable tokens */
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        secondary: 'var(--color-secondary)',
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)'
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)'
      },
      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)'
      },
      fontFamily: {
        sans: ['var(--font-sans)']
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)'
      }
    }
  },
  plugins: [typography]
};

export default config;


