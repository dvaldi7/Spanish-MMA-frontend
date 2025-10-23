/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "bg-octagon": "url('/bg-octagon.jpg')",
      },
      colors: {
        'custom-blue': '#1e3a8a',
        'custom-gold': '#ffdb0fe5',
        "custom-black": "#000511ff",
        "custom-red": "#e60303ff"
      },
      animation: {
        'spin-slow': 'spin 7s linear infinite',
        'from-bellow': 'fromBellow 500ms linear',
        'from-right': 'fromRight 300ms linear',
        'bg-banner': 'mmaBanner 10s linear',
        'show-card-icon': 'showCardIcon 300ms linear',
        'show-card-category': 'showCategory 400ms linear',
        'show-card-desc': 'showDesc 400ms linear',
      },
      keyframes: {
        fromBellow: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(200%)' },
          '100%': { transform: 'translateY(0%)' },
        },
        fromRight: {
          '0%': { transform: 'translateX(200%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        mmaBanner: {
          '0%': { 'background-position': '0px 0px' },
          '50%': { 'background-position': '-100px -100px' },
          '100%': { 'background-position': '0px 0px' },
        },
        showCardIcon: {
          'from': { transform: 'translateY(-200%)' },
          'to': { transform: 'translateY(0%)' },
        },
        showCategory: {
          'from': { transform: 'translateY(-300%)' },
          'to': { transform: 'translateY(0%)' },
        },
        showDesc: {
          'from': { transform: 'translateX(-300%)' },
          'to': { transform: 'translateX(0%)' },
        },

      },


    },
  },
  plugins: [],
}

