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
          'green': '#1B392F', // Deep forest green from the login screen
          'background': '#f5f5f5', // Warm beige background
          'white': '#FFFFFF',
          'text': '#1A2421', // Dark text color
        },
        'tasty-background': '#F8F7F4', // or whatever your background color value is
        sage: {
          50: '#f7f8f6',
          600: '#5c6758',
        },
        olive: {
          50: '#f4f5e9',
          600: '#5a5c3f',
        },
        khaki: {
          50: '#f9f7f0',
          600: '#8b7e55',
        },
        earthgreen: {
          50: '#f2f7f2',
          600: '#2d5a27',
        },
        cookred: {
          50: '#fdf4f4',
          600: '#a92f2f',
        },
      },
      fontFamily: {
        'display': ['Freight Display Pro', 'Playfair Display', 'serif'], // For headings
        'sans': ['Inter', 'sans-serif'], // For body text
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