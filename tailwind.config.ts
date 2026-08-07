import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "oklch(0.98 0.01 85)",
          soft: "oklch(0.955 0.012 85)",
        },
        surface: {
          DEFAULT: "oklch(0.995 0.004 85)",
          raised: "oklch(1 0 0)",
        },
        ink: {
          DEFAULT: "oklch(0.22 0.04 250)",
          soft: "oklch(0.45 0.035 250)",
          faint: "oklch(0.50 0.025 250)",
        },
        accent: {
          DEFAULT: "oklch(0.70 0.12 230)",
          deep: "oklch(0.50 0.13 230)",
          soft: "oklch(0.95 0.03 230)",
        },
        border: {
          DEFAULT: "oklch(0.22 0.04 250 / 0.12)",
          soft: "oklch(0.22 0.04 250 / 0.06)",
        },
        gold: {
          DEFAULT: "oklch(0.72 0.11 75)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 2.2rem + 3.5vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.25rem, 1.8rem + 2vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-lg": ["clamp(1.75rem, 1.5rem + 1.2vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.375rem, 1.25rem + 0.6vw, 1.75rem)", { lineHeight: "1.15" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.14em" }],
      },
      spacing: {
        "0.5x": "4px",
        "1x": "8px",
        "2x": "16px",
        "3x": "24px",
        "4x": "32px",
        "5x": "40px",
        "6x": "48px",
        "8x": "64px",
        "10x": "80px",
        "12x": "96px",
        "16x": "128px",
        "20x": "160px",
        "24x": "192px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      maxWidth: {
        content: "1200px",
        prose: "68ch",
      },
      transitionTimingFunction: {
        institutional: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      boxShadow: {
        card: "0 1px 2px oklch(0.22 0.04 250 / 0.04), 0 8px 24px -8px oklch(0.22 0.04 250 / 0.10)",
        raised: "0 2px 4px oklch(0.22 0.04 250 / 0.06), 0 16px 40px -12px oklch(0.22 0.04 250 / 0.16)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "route-draw": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both",
        "route-draw": "route-draw 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
