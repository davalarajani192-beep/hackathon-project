/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#14402F',     // Primary dark green
          mid: '#3E8E6A',      // Mid green for icons, buttons, accents
          light: '#EDF3EF',    // Light card background
          accent: '#F0922B',   // Accent orange for CTAs, countdowns, highlights
          blue: '#2E86AB',     // Secondary blue for info, secondary icons
          mint: '#9CC5AA',     // Muted mint text on dark
          darker: '#0D2B20',
          hoverMid: '#347859',
          hoverAccent: '#D87D1A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 64, 47, 0.08), 0 2px 6px -2px rgba(20, 64, 47, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(20, 64, 47, 0.12), 0 4px 10px -2px rgba(20, 64, 47, 0.06)',
      }
    },
  },
  plugins: [],
}
