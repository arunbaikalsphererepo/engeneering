import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        navy: {
          50:  "#eef3f8",
          100: "#d5e2ef",
          200: "#aac5df",
          300: "#7fa8cf",
          400: "#548bbf",
          500: "#2a6eaf",
          600: "#1e5a8f",
          700: "#174872",
          800: "#113657",
          900: "#0d2840",
          950: "#091b2c",
        },
      },
      boxShadow: {
        card:         "0 1px 2px rgba(14,19,28,0.04), 0 1px 1px rgba(14,19,28,0.03)",
        "card-hover": "0 4px 16px rgba(14,19,28,0.08), 0 2px 4px rgba(14,19,28,0.04)",
        sm:           "0 1px 2px rgba(14,19,28,0.04), 0 1px 1px rgba(14,19,28,0.03)",
        md:           "0 4px 12px rgba(14,19,28,0.06), 0 1px 2px rgba(14,19,28,0.04)",
      },
      backgroundOpacity: {
        8: "0.08",
      },
    },
  },
  plugins: [],
};

export default config;
