/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#475569",
        accent: "#F59E0B",
        bg: "#F8FAFC",
      },
    },
  },
  plugins: [],
}
