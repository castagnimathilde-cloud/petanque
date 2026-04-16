/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#E8F0F8',
          100: '#C5D6EC',
          200: '#A2BCE0',
          300: '#7FA3D4',
          400: '#5C89C8',
          500: '#3970BC',
          600: '#1A3A5C',
          700: '#142D47',
          800: '#0E2033',
          900: '#081320',
        },
        gold: {
          DEFAULT: '#E8A020',
          light:   '#F5C842',
          dark:    '#C07010',
        },
      },
    },
  },
  plugins: [],
}
