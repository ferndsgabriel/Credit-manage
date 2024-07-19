/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'dark1':'#080D1A',
        'dark4':'#202B47',
        'dark5':'rgba(255,255,255, 0.2)',
        'dark6':'rgba(255,255,255, 0.6)',
      },
      keyframes: {
        'spin-reverse': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(-360deg)',
          },
        },
      },
      animation: {
        'spin-reverse': 'spin-reverse 1s linear infinite',
      },
      aspectRatio:{
        'card':"1/1,59"
      }
    },
  },
  plugins: [],
}