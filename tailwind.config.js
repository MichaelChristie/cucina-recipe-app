/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
} 