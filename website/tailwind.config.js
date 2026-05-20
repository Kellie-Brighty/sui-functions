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
          dark: '#05060a',
          card: '#0a0b10',
          'card-border': '#23263b',
          orange: '#FF7E21',
          'orange-glow': 'rgba(255, 126, 33, 0.15)',
          blue: '#3b82f6',
          'blue-glow': 'rgba(59, 130, 246, 0.15)',
          green: '#10b981',
          'green-glow': 'rgba(16, 185, 129, 0.15)',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        outfit: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 0 40px rgba(255, 126, 33, 0.15)',
        'card-glow': '0 10px 30px -10px rgba(0,0,0,0.7), 0 0 15px rgba(255,126,33,0.05)',
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
