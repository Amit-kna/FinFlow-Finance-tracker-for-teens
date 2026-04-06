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
        background: "#0A0C10", // Dark Navy/Black
        surface: "#1A1D24",    // Card Background
        surfaceGlass: "rgba(26, 29, 36, 0.6)", // For glassmorphism cards
        accent: "#00E676",     // Bright Green
        accentDark: "#00C853", // Darker Bright Green
        textMain: "#FFFFFF",
        textMuted: "#9CA3AF",
        danger: "#FF3B30",
        dangerDark: "#D32F2F",
        purpleAccent: "#B388FF",
        purpleDark: "#651FFF"
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 230, 118, 0.2)',
        'glow-purple': '0 0 20px rgba(179, 136, 255, 0.2)',
        'glow-danger': '0 0 20px rgba(255, 59, 48, 0.2)',
        'glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
