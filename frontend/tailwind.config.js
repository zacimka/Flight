/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0f',
        paper: '#f5f3ee',
        gold: {
          DEFAULT: '#c9963a',
          light: '#e8b96a',
        },
        rust: '#c44b2b',
        teal: {
          DEFAULT: '#1a6b6b',
          light: '#2a9090',
        },
        muted: '#7a7870',
        border: '#ddd9d0',
        card: '#ffffff',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
