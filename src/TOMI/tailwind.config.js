/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx,css}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ── TOMI Design Tokens (Sunny default) ── */
        primary:         '#ff8c42',
        'primary-pressed': '#ff7324',
        secondary:       '#4a90e2',
        'text-primary':  '#1a202c',
        'text-muted':    '#718096',
        warning:         '#f59e0b',
        danger:          '#ef4444',
        success:         '#10b981',
        background:      '#fefefe',
      },
      borderRadius: {
        '2xl':  '16px',
        '3xl':  '24px',
        '4xl':  '32px',
      },
      boxShadow: {
        '3xl': '0 32px 64px -12px rgba(0,0,0,0.20)',
      },
    },
  },
  plugins: [],
};
