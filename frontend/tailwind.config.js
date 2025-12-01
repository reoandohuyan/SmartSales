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
          '0%, 50%, 100%': {
            opacity: '1',
            textShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 20px #06b6d4'
          },
          '25%, 75%': {
            opacity: '0.2',
            textShadow: 'none'
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleUp: 'scaleUp 0.3s ease-out',
        float: 'float 4s ease-in-out infinite',
        blink: 'blink 1s infinite',
      },
    },
  },
  plugins: [],
};
