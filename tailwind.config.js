/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#516d85',
        'accent-yellow': '#FFEB70',
        'accent-green': '#C1E1C1',
        'accent-red': '#E74C3C',
        'background-light': '#F5F4F0',
        'background-dark': '#17191b',
      },
      fontFamily: {
        display: ['Inter', 'Noto Sans', 'sans-serif'],
        body: ['Inter', 'Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
