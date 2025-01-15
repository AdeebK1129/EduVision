/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb", // Light gray for background
        foreground: "#111827", // Dark gray for text
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure this is present
  ],
};
