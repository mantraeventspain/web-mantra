/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mantra: {
          gold: "#D4A657",
          darkGold: "#B38B45",
          blue: "#1A2B3C",
          darkBlue: "#0F1A24",
        },
        primary: "#6366f1",
        secondary: "#4f46e5",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
