import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        organa: {
          bg: '#0A0A0F',
          surface: '#12121A',
          border: '#1E1E2E',
          accent: '#6C63FF',
          'accent-hover': '#5A52E0',
          muted: '#3A3A5C',
          text: '#E2E2F0',
          'text-muted': '#7A7A9A',
        },
      },
    },
  },
  plugins: [],
}

export default config
