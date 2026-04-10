/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate 900
        surface: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity for glassmorphism
        surfaceBorder: 'rgba(255, 255, 255, 0.1)',
        surfaceHover: 'rgba(51, 65, 85, 0.8)', // Slate 700 with opacity
        primary: '#3b82f6', // Blue 500
        primaryHover: '#2563eb', // Blue 600
        accent: '#8b5cf6', // Violet 500
        textPrimary: '#f8fafc', // Slate 50
        textSecondary: '#94a3b8', // Slate 400
        danger: '#ef4444', // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
