/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'silverleaf-blue': '#003366',
        'silverleaf-orange': '#FF8C42',
        'primary-blue': '#3B82F6',
        'primary-green': '#10B981',
      },
    },
  },
  plugins: [],
}
