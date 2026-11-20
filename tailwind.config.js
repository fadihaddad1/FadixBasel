/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0B0D12', 900: '#11141B', 850: '#161A23', 800: '#1C212C', 700: '#272D3B', 600: '#3A4253', 400: '#8A93A6', 300: '#B4BBC9', 100: '#EEF0F5' },
        prime: { DEFAULT: '#2EE6A6', soft: '#2EE6A61F', deep: '#0FA877' },
        steady: { DEFAULT: '#FFB547', soft: '#FFB5471F', deep: '#D98A12' },
        recharge: { DEFAULT: '#FF6B6B', soft: '#FF6B6B1F', deep: '#D94848' },
        spark: { DEFAULT: '#7C8CFF', soft: '#7C8CFF1F' },
        sun: '#FF8A3D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.6)',
        glow: '0 0 40px -6px var(--glow, #2EE6A6)',
      },
      keyframes: {
        pulseRing: { '0%,100%': { opacity: '0.5', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.04)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        pulseRing: 'pulseRing 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
