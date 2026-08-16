/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: {
          DEFAULT: '#18181B',
          hover: '#27272A',
          subtle: 'rgba(24, 24, 27, 0.65)',
        },
        border: {
          DEFAULT: '#27272A',
          subtle: 'rgba(39, 39, 42, 0.6)',
        },
        accent: {
          DEFAULT: '#10B981',
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        emerald: {
          500: '#10B981',
          400: '#34D399',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'pill': '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
