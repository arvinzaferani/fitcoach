import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        "primary-dark": "#5A52D5",
        secondary: "#FF6B35",
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
