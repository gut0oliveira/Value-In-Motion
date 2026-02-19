/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mint: "#16a34a",
        sky: "#0ea5e9",
        clay: "#f1f5f9",
      },
    },
  },
  plugins: [],
};
