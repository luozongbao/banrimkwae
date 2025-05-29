/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'resort-blue': '#2E86AB',
        'forest-green': '#A23B72',
        'warm-orange': '#F18F01',
        'sunset-red': '#C73E1D',
        'dark-charcoal': '#2D3748',
        'medium-gray': '#4A5568',
        'light-gray': '#E2E8F0',
        'off-white': '#F7FAFC',
      },
      fontFamily: {
        'sans': ['Inter', 'Arial', 'sans-serif'],
        'thai': ['Sarabun', 'Arial Unicode MS', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
