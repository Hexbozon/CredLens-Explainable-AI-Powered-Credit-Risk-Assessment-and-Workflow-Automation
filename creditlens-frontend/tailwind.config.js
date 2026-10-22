/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0284c7",
          dark: "#0369a1",
          light: "#e0f2fe",
          subtle: "#f0f9ff",
        },
        canvas: "#f8fafc",
        card: "#ffffff",
        borderGray: "#e2e8f0",
        borderSubtle: "#edf2f7",
        textMain: "#0f172a",
        textMuted: "#475569",
        textLight: "#64748b",
        risk: {
          green: "#0284c7",
          greenBg: "#e0f2fe",
          amber: "#d97706",
          amberBg: "#fef3c7",
          amberBorder: "#fde68a",
          red: "#e11d48",
          redBg: "#ffe4e6",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        custom: "12px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-lift": "0 12px 30px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(2, 132, 199, 0.06)",
        "float-badge": "0 8px 20px -3px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(226, 232, 240, 0.8)",
        "glacier-glow": "0 0 25px -5px rgba(2, 132, 199, 0.2)",
      },
    },
  },
};
