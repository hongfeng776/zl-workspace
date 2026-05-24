/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a1a',
          dark: '#0f0f2a',
          card: '#1a1a3a',
          primary: '#00f5ff',
          secondary: '#a855f7',
          accent: '#22c55e',
          danger: '#ef4444',
          warning: '#f97316',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff',
        'neon-purple': '0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7',
        'neon-green': '0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 30px #22c55e',
        'neon-red': '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px #00f5ff, 0 0 10px #00f5ff' },
          '100%': { boxShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff' },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
