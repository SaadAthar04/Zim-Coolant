/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#66FF00', // Bright Green - Main brand color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#013220', // Dark Green - Secondary brand color
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#013220', // Dark Green
          600: '#166534',
          700: '#15803d',
          800: '#14532d',
          900: '#052e16',
        },
        accent: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#66FF00', // Bright Green accent
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          bright: '#66FF00', // Bright Green
          dark: '#013220',   // Dark Green
          light: '#f0fff4',  // Very light green
          medium: '#16a34a', // Medium green
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #66FF00, 0 0 10px #66FF00, 0 0 15px #66FF00' },
          '100%': { boxShadow: '0 0 10px #66FF00, 0 0 20px #66FF00, 0 0 30px #66FF00' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #66FF00 0%, #013220 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #013220 0%, #66FF00 100%)',
        'gradient-green': 'linear-gradient(135deg, #f0fff4 0%, #66FF00 50%, #013220 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(102, 255, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(102, 255, 0, 0.4)',
        'glow-xl': '0 0 60px rgba(102, 255, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
