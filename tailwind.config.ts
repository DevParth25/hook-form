/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        'form-bg': '#F1F3F4', // Light gray background
        'form-card': '#FFFFFF', // White card background
        'form-border': '#DADCE0', // Subtle gray border
        'form-text': '#202124', // Primary text
        'form-secondary': '#5F6368', // Secondary text
        'form-error': '#D93025', // Error text
        'form-purple': '#673AB7', // Purple accents
        'form-blue': '#4285F4', // Blue buttons and focus
        'form-blue-light': '#E8F0FE', // Light blue hover
      },
    },
  },
  plugins: [],
};