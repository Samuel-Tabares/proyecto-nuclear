import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Archivo Black", "Impact", "sans-serif"],
        body: ["Aptos", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        graphite: "#111914",
        "graphite-2": "#1a241e",
        bone: "#f5f0e6",
        amberline: "#f2a900",
        cyanline: "#2dd4bf",
        dangerline: "#e24a3b",
        goodline: "#39b66f",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(17, 25, 20, .16)",
      },
      animation: {
        "panel-in": "panel-in .45s ease both",
        "pulse-line": "pulse-line 2.8s ease-in-out infinite",
      },
      keyframes: {
        "panel-in": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: ".45" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
