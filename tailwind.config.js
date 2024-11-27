/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#9b9b9b",
        primary: "#1B1A17",
        secondary: "#F0A500",
        tertiary: "#E45826",
        contrast: "#E6D5B8",
      },
    },
  },
  plugins: [],
};
