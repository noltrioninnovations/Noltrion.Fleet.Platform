/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // Slate 900
        secondary: '#334155', // Slate 700
        accent: '#0ea5e9', // Sky 500
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
        border: '#e2e8f0', // Slate 200
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xxs: '0.625rem', // 10px
      }
    },
  },
  plugins: [],
}
