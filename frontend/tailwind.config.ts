import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}", "./e2e/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        credible: "rgb(var(--color-credible) / <alpha-value>)",
        caution: "rgb(var(--color-caution) / <alpha-value>)",
        critical: "rgb(var(--color-critical) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 18px 50px rgb(20 32 51 / 0.08)",
        glow: "0 24px 80px rgb(255 128 98 / 0.22)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Georgia", "ui-serif", "serif"],
        display: ["var(--font-display)", "Georgia", "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
