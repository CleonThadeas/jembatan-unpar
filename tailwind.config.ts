import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f3',
          100: '#d6ece3',
          200: '#b0d9c9',
          300: '#80bea9',
          400: '#4b9e89',
          500: '#258270',
          600: '#0a6c63',
          700: '#00564f',
          800: '#09665e',
          900: '#003f3a',
          950: '#002c29',
        },
        gold: {
          50: '#fffbe0',
          100: '#fff4b3',
          200: '#ffeb00',
          400: '#ffe04d',
          500: '#ffd400',
          600: '#e6be00',
          700: '#8a6d00',
        },
        // Palette tokens from laporan_analisis_ui_website_unpar.md.
        ink: {
          600: '#626a66',
          900: '#252525',
        },
        surface: {
          50: '#f6f7f4',
        },
        seal: {
          yellow: '#ffeb00',
          green: '#00a651',
          red: '#e63238',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
        display: ['var(--font-montserrat)', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out both',
        'fade-out': 'fade-out 300ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
