/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#76b0ab',
          dark: '#5a8d89', // Darker shade for hover
          light: '#98c5c1', // Lighter shade for accents
        },
        background: '#f8fafc', // Light gray background
        surface: '#ffffff', // White surface
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
