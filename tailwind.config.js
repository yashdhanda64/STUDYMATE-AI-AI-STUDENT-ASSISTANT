/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070A12',
          900: '#0B0F19',
          850: '#0E1424',
          800: '#131B2E',
          750: '#18223A',
          700: '#1E2945',
          600: '#2A385E',
        },
        brand: {
          purple: {
            light: '#A78BFA',
            DEFAULT: '#8B5CF6',
            dark: '#7C3AED',
            deep: '#6D28D9',
          },
          blue: {
            light: '#60A5FA',
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
          },
          accent: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        }
      }
    },
  },
  plugins: [],
}
