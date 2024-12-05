/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.7s ease-out',
        'blob': 'blob 3s infinite',
        'float': 'float 5s ease-in-out infinite',
        'gradient-x': 'gradientX 10s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translateX(0) scale(1)' },
          '33%': { transform: 'translateX(-30px) scale(1.1)' },
          '66%': { transform: 'translateX(30px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientX: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        }
      },
      animationDelay: {
        '2000': '2000ms',
        '4000': '4000ms',
        '300': '300ms',
        '600': '600ms',
        '900': '900ms'
      }
    }
  },
  plugins: [],
}
