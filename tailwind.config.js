/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0E1A',
          900: '#0F1424',
          850: '#131A2E',
          800: '#18203A',
          700: '#232D4D',
          600: '#334066',
          500: '#5B6890',
          400: '#8A95B8',
          300: '#B4BDD8',
          200: '#D7DCEC',
          100: '#EEF1F8',
        },
        brand: { 300: '#B3A9FF', 400: '#9A8CFF', 500: '#7C6CFF', 600: '#6553F0', 700: '#4E3DD0' },
        xp: { 400: '#FCD34D', 500: '#FBBF24' },
        ok: { 400: '#4ADE80', 500: '#22C55E' },
        bad: { 400: '#F87171', 500: '#EF4444' },
        streak: { 400: '#FB923C', 500: '#F97316' },
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(124,108,255,0.35), 0 8px 30px -8px rgba(124,108,255,0.45)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        'pop-in': { '0%': { opacity: 0, transform: 'scale(.85)' }, '60%': { opacity: 1, transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
        'confetti': { '0%': { transform: 'translate3d(0,0,0) rotate(0)', opacity: 1 }, '100%': { transform: 'translate3d(var(--dx), 110vh, 0) rotate(var(--rot))', opacity: 0.9 } },
        'shine': { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.2,.7,.2,1) both',
        'pop-in': 'pop-in .5s cubic-bezier(.2,.9,.3,1.2) both',
        'confetti': 'confetti var(--dur) cubic-bezier(.2,.6,.4,1) forwards',
        'shine': 'shine 1.6s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
