import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sa-ink": "#102a3f",
        "sa-night": "#0b1c2b",
        "sa-blue": "#1f5f8b",
        "sa-blue-deep": "#14304a",
        "sa-cream": "#f7f2e8",
        "sa-line": "#dcd5c8",
        "sa-orange": "#e2703a",
        "sa-orange-soft": "#fbe9d6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "Segoe Script", "cursive"],
      },
      keyframes: {
        "sa-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sa-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "sa-up": "sa-up 800ms cubic-bezier(.22,1,.36,1) both",
        "sa-fade": "sa-fade 600ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
