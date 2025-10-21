/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1e3a8a',
        'custom-gold': '#ffdb0fe5',
        "custom-black": "#000511ff",
        "custom-red": "#e60303ff"
      },
    },
  },
  plugins: [],
}

