/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080C15',
          card: '#0D1322',
          surface: '#121B30',
          border: 'rgba(56, 189, 248, 0.15)',
          cyan: '#00F2FE',
          blue: '#4FACFE',
          purple: '#9333EA',
          neon: '#A855F7',
          pink: '#EC4899',
          amber: '#F59E0B',
          emerald: '#10B981',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(0, 242, 254, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 254, 0.05) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(circle at 50% 30%, rgba(0, 242, 254, 0.15), rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(147, 51, 234, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(0, 242, 254, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
