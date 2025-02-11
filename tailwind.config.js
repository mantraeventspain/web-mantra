/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["AbhayaLibre", "system-ui", "sans-serif"],
        abhaya: ["AbhayaLibre", "serif"],
      },
      colors: {
        mantra: {
          gold: "#D4A657", // Color dorado principal
          darkGold: "#B38B45", // Versión más oscura del dorado
          orange: "#FF8C42",
          darkOrange: "#E67E3B",
          warmBlack: "#1A1614",
          blue: "#1A2B3C",
          darkBlue: "#0F1A24",
        },
        primary: "#6366f1",
        secondary: "#4f46e5",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
