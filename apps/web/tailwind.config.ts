import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
        },
        border: "var(--border-default)",
        accent: {
          start: "var(--accent-start)",
          end: "var(--accent-end)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
