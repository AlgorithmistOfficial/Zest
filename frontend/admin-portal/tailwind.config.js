/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#052340",
        lime: "#92c211",
        'off-white': '#fffef2',
      }
    },
  },
  plugins: [],
}
