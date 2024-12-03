/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tasty': {
          'green': '#1B392F',
          'background': '#f5f5f5',
          'white': '#FFFFFF',
          'text': '#1A2421',
        }
      },
      fontFamily: {
        'display': ['Freight Display Pro', 'Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['2.75rem', {
          lineHeight: '3rem',
          letterSpacing: '-0.02em',
        }],
        'display-medium': ['2rem', {
          lineHeight: '2.5rem',
          letterSpacing: '-0.01em',
        }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 