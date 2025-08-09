/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Keep defaults; add xs helper if ever needed
        // xs: '360px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 