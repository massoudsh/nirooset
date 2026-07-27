/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        energy: {
          green: '#10b981',
          'green-dark': '#059669',
          'green-light': '#34d399',
          blue: '#3b82f6',
          'blue-dark': '#2563eb',
          yellow: '#fbbf24',
          orange: '#f97316',
        },
        grid: {
          dark: '#0f172a',
          'dark-light': '#1e293b',
          gray: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
