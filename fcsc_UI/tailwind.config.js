/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./**/*.{html}",          // Scan the HTML file for Tailwind classes
      "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX/TS/TSX files in the `src` folder
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('tailwind-scrollbar'),
    ],
  }
  
  