/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        animaStart: "#fde2f1",
        animaEnd: "#e6e1ff",
        animaRed: "#ff8a8a",
        animaOrange: "#f9c97a",
        animaGreen: "#8ee08b",
        animaText: "#1a1a1a",
      },
      boxShadow: {
        glow: "0 0 50px rgba(255, 192, 203, 0.35)",
      }
    },
  },
  plugins: [],
}
