/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#17171a',
          700: '#1f1f23',
          600: '#2a2a30',
        },
        bone: {
          50:  '#faf8f4',
          100: '#f2efe8',
          200: '#e6e1d6',
          300: '#cfc9bb',
          400: '#a8a298',
          500: '#7a756c',
          600: '#5a5650',
        },
        gold: {
          300: '#e6c590',
          400: '#d4a574',
          500: '#c49060',
          600: '#a57848',
        },
      },
      letterSpacing: {
        widest: '0.22em',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
