/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      colors: {
        primary: {
          DEFAULT: '#000000', // Deep Black
          light: '#2d2d2d',
          dark: '#000000',
        },
        secondary: {
          DEFAULT: '#707070', // Soft Gray
          light: '#a3a3a3',
          dark: '#404040',
        },
        accent: {
          DEFAULT: '#D4C9BC', // Sand/Beige
          light: '#E2D9CF',
          dark: '#BDB1A3',
        },
        background: {
          DEFAULT: '#FFFFFF',
          off: '#F8F8F8', // Off-White
        },
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        heading: ['Inter', 'sans-serif'], // AXIOMA often uses bold sans for main headings too, but I'll add serif for variety
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '2rem',
          sm: '3rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-up': 'scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
