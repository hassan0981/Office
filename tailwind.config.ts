import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF6EF",
        foreground: "#2D2621",
        cream: {
          50: "#FDFBF7",
          100: "#FAF6EF",
          200: "#F3EDE2",
          300: "#E8DEC9",
          400: "#D6C7A9",
          500: "#B8A380",
          900: "#2D2621",
        },
        terracotta: {
          50: "#FFF2EE",
          100: "#FFE2D9",
          200: "#FFC2B3",
          300: "#FF9B82",
          400: "#FF7B5C",
          500: "#FF6B4A",
          600: "#E04E2E",
          700: "#B8381C",
          800: "#912D18",
          900: "#752818",
        },
        sage: {
          50: "#F2F7F4",
          100: "#DEEBE4",
          200: "#BFD7CB",
          300: "#96BDAB",
          400: "#6C9F8A",
          500: "#5B8C73",
          600: "#456E5A",
          700: "#385848",
        },
        charcoal: {
          50: "#F5F4F3",
          100: "#E5E3E0",
          200: "#C7C4BE",
          300: "#A39E96",
          400: "#7C776F",
          500: "#5E5952",
          600: "#49453F",
          700: "#3A3229",
          800: "#2D2621",
          900: "#1A1613",
        },
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        warm: "0 10px 30px -10px rgba(58, 50, 41, 0.08)",
        "warm-md": "0 14px 35px -10px rgba(58, 50, 41, 0.12)",
        "warm-lg": "0 20px 45px -15px rgba(58, 50, 41, 0.16)",
        glow: "0 0 25px -5px rgba(255, 107, 74, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
