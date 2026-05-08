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
        primary: {
          50: '#e6f5f5',
          100: '#ccebeb',
          200: '#99d6d6',
          300: '#66c2c2',
          400: '#33adad',
          500: '#008080', // Brand teal
          600: '#006666',
          700: '#004d4d',
          800: '#003333',
          900: '#001a1a',
        },
        secondary: {
          50: '#fef2f0',
          100: '#fde5e1',
          200: '#fbcbc3',
          300: '#f9b1a5',
          400: '#f79787',
          500: '#f04923', // Brand orange
          600: '#c03a1c',
          700: '#902c15',
          800: '#601d0e',
          900: '#300f07',
        },
      },
      fontFamily: {
        sans: ['var(--font-yekan)', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
