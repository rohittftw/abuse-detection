/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        home: {
          bg: "var(--home-bg)",
          surface: "var(--home-surface)",
          "surface-elevated": "var(--home-surface-elevated)",
          heading: "var(--home-heading)",
          body: "var(--home-body)",
          muted: "var(--home-muted)",
          border: "var(--home-border)",
          accent: "var(--home-accent)",
          "accent-hover": "var(--home-accent-hover)",
          "accent-soft": "var(--home-accent-soft)",
          purple: "var(--home-purple)",
          "purple-hover": "var(--home-purple-hover)",
          lavender: "var(--home-lavender)",
          navy: "var(--home-navy)",
          mint: "var(--home-mint)",
          "blue-soft": "var(--home-blue-soft)",
        },
        portfolio: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-soft": "var(--color-surface-soft)",
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          border: "var(--color-border)",
          "border-strong": "var(--color-border-strong)",
          accent: "var(--color-accent-bg)",
          "accent-text": "var(--color-accent-text)",
          hover: "var(--color-hover-bg)",
          shadow: "var(--color-shadow)",
          backdrop: "var(--color-backdrop)",
          success: "var(--color-success)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      maxWidth: {
        content: "900px",
      },
      width: {
        sidebar: "280px",
      },
      boxShadow: {
        card: "0 10px 30px -10px var(--color-shadow)",
      },
    },
  },
  plugins: [],
};
