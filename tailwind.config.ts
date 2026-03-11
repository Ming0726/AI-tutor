import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FFF5E6", dark: "#F5E6D0" },
        accent: { DEFAULT: "#F5A623", hover: "#E6951A", light: "#FFF0D4" },
        text: { primary: "#3D3D3D", secondary: "#8C8C8C" },
        card: { DEFAULT: "#FFFFFF", border: "#F0E6D6" },
        success: "#4CAF50",
        error: "#E74C3C",
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        display: ["Baloo 2", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
