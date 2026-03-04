import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          bg: '#05070A',
          card: '#0D1117',
          green: '#50C878',
          'green-light': '#7DD99A',
          'green-dark': '#3BAA5E',
          border: 'rgba(255, 255, 255, 0.05)',
          text: '#C9D1D9',
          accent: '#7928CA',
          'accent-end': '#FF0080',
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(80, 200, 120, 0.18)',
        'green-glow-lg': '0 0 40px rgba(80, 200, 120, 0.25)',
        'accent-glow': '0 0 20px rgba(121, 40, 202, 0.2)',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #50C878 0%, #3BAA5E 100%)',
        'dark-gradient': 'radial-gradient(circle at top, #0D1117 0%, #05070A 100%)',
      },
    },
  },
  plugins: [],
}
export default config
