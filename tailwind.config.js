/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F3864',
        'primary-light': '#9DC3E6',
      },
    },
  },
  plugins: [],
}
