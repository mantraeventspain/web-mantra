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
          gold: "#C85627", // Naranja terracota principal (más cálido y terroso)
          darkGold: "#8B3613", // Marrón rojizo oscuro para iconos
          orange: "#E67E22", // Naranja tierra brillante
          darkOrange: "#6B2B0E", // Marrón oscuro rojizo
          warmBlack: "#2C1810", // Marrón muy oscuro
          light: "#F4A460", // Arena dorada cálida

          // Fondos y gradientes
          blue: "#1E1410", // Marrón muy oscuro (reemplaza el azul)
          darkBlue: "#0D0807", // Casi negro con tinte marrón
        },
        primary: "#C85627", // Mismo que gold para consistencia
        secondary: "#8B3613", // Mismo que darkGold para consistencia
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "zoom-in-95": "zoomIn95 0.3s ease-out",
        "slide-in-from-bottom-4": "slideInFromBottom4 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn95: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInFromBottom4: {
          "0%": { opacity: "0", transform: "translateY(1rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
