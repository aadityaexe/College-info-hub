/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Luxury Palette
        background: '#fdfbf7', // Warm Cream / Off-White
        surface: '#ffffff', // Pure White
        primary: {
          50: '#fbf7e6',
          100: '#f5ecc4',
          200: '#ebd994',
          300: '#dec05e',
          400: '#d4af37', // Gold Main
          500: '#b89228',
          600: '#9d751e',
          700: '#7d5818', // Gold Dark
          800: '#68471a',
          900: '#583b1a',
        },
        secondary: {
            500: '#0f172a', // Deep Royal Blue / Slate (Keep for contrast accents)
            900: '#1e293b', // Lighter Slate for footer/dark areas
        },
        text: {
            main: '#1a202c', // Dark Slate (High contrast)
            muted: '#64748b', // Cool Grey
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
