/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        neural: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#252533',
          500: '#303040',
        },
        pulse: {
          blue: '#4a9eff',
          purple: '#9d4edd',
          pink: '#ff6b9d',
          cyan: '#00f5d4',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgba(74, 158, 255, 0.2)' },
          '100%': { 'box-shadow': '0 0 20px rgba(74, 158, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
