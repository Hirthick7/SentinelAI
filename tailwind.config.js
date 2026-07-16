/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#060913",
          card: "#0d1326",
          border: "#1f2d54",
          primary: "#00f0ff", // Neon Cyan
          secondary: "#bd00ff", // Neon Purple
          danger: "#ff0055", // Neon Pink/Red
          warning: "#ffaa00", // Neon Orange
          success: "#00ff66", // Neon Green
          info: "#00a8ff", // Neon Blue
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'glow-purple': '0 0 15px rgba(189, 0, 255, 0.25)',
        'glow-danger': '0 0 15px rgba(255, 0, 85, 0.25)',
        'glow-success': '0 0 15px rgba(0, 255, 102, 0.25)',
        'glow-warning': '0 0 15px rgba(255, 170, 0, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
