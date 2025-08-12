import base from '../../packages/ui-theme/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
  ...base,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...base.theme,
    extend: {
      ...(base.theme as any)?.extend,
    },
  },
  plugins: [
    ...(base as any).plugins,
    require('tailwindcss-animate'),
  ],
} satisfies Config;



