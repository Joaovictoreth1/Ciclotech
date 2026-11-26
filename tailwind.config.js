export default {
  content: ["./index.html", "./src/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        quantum: {
          base: "#000000", // Pure OLED Black
          surface: "#020a06", // Extreme Dark Green
          card: "#03120b", // Elevated Card
          border: "rgba(0, 255, 163, 0.15)",
          neon: "#00ffa3", // Hyper-Green
          cyan: "#00e5ff", // Accent Cyan
          warning: "#ffb300", // Warning
          error: "#ef4444", // Error Red
        },
      },
      animation: {
        "radar-sweep": "radarSweep 4s linear infinite",
        glitch: "glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite",
        "hud-scan": "hudScan 3s ease-in-out infinite alternate",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        hudScan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        glowPulse: {
          "0%": { boxShadow: "0 0 10px rgba(0,255,163,0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(0,255,163,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
};
