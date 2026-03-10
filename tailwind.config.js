/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        seat: {
          available: '#4ade80',
          reserved: '#fbbf24',
          sold: '#94a3b8',
          held: '#f87171',
          selected: '#6366f1',
          'selected-stroke': '#4f46e5',
        },
        stage: {
          bg: 'rgba(99, 102, 241, 0.08)',
          border: 'rgba(99, 102, 241, 0.3)',
          text: '#6366f1',
        },
      },
      animation: {
        'tooltip-in': 'tooltipFadeIn 150ms ease',
        'slide-in': 'slideIn 200ms ease',
        'spin-slow': 'spin 0.8s linear infinite',
      },
      keyframes: {
        tooltipFadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -90%)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -100%)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
