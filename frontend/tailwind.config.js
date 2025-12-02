/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blink: {
  '0%, 100%': {
    opacity: 1,
    textShadow: '0 0 6px #06b6d4, 0 0 12px #06b6d4'
  },
  '50%': {
    opacity: 0.7,
    textShadow: '0 0 3px #06b6d4'
  },
},

      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleUp: 'scaleUp 0.3s ease-out',
        float: 'float 4s ease-in-out infinite',
        blink: 'blink 2.5s ease-in-out infinite',

      },
    },
  },
  plugins: [],
};
