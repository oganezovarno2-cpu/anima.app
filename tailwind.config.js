/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        anima: {
          ink: "#3A355E",
          pink: "#F6B1D0",
          lilac: "#CDBBFF",
          sky:  "#9AD7FF",
          peach:"#FFD9C7"
        }
      },
      boxShadow: {
        glass: "0 12px 40px rgba(58,53,94,.18)"
      },
      borderRadius: {
        xl2: "28px"
      }
    }
  },
  plugins: []
}
