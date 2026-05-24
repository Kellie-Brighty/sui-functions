/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#F9FAFB',
        'slate-pro': '#1F2937',
        brand: {
          dark: '#0B101E',
          card: '#0A1C2E',
          'card-border': '#14304A',
          sui: '#3898FF',
          'sui-glow': 'rgba(56, 152, 255, 0.15)',
          indigo: '#003B5C',
          'indigo-glow': 'rgba(99, 102, 241, 0.15)',
          cyan: '#6FB7B7',
          'cyan-glow': 'rgba(6, 182, 212, 0.15)',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        outfit: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'sui-glow': '0 0 40px rgba(56, 152, 255, 0.15)',
        'card-glow': '0 10px 30px -10px rgba(0,0,0,0.7), 0 0 15px rgba(56, 152, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 7s ease-in-out infinite reverse',
        'float-reverse': 'float 6s ease-in-out infinite reverse',
        'aurora': 'aurora 15s linear infinite',
        'shimmer': 'shimmer 3s infinite linear',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        aurora: {
          '0%': { transform: 'translateX(-50%) rotate(-8deg) scale(1)' },
          '50%': { transform: 'translateX(-40%) rotate(-5deg) scale(1.1)' },
          '100%': { transform: 'translateX(-50%) rotate(-8deg) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
