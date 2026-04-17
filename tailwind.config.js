/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50:  '#f7f4ea',
          100: '#efeadb',
          200: '#e4dcc4',
          300: '#d4c8a4',
        },
        olive: {
          50:  '#f2f3e9',
          100: '#e2e5c8',
          200: '#c6cda0',
          300: '#a7b277',
          400: '#879355',
          500: '#6b7d3a',
          600: '#556b2f',
          700: '#435525',
          800: '#33411d',
          900: '#232c14',
        },
        khaki: {
          400: '#b5a877',
          500: '#9a8c5a',
          600: '#7c6f44',
        },
        ink: {
          900: '#2a2e1f',
          700: '#4a4e3f',
          500: '#6b6856',
          300: '#9c9882',
        },
      },
    },
  },
  plugins: [],
};
