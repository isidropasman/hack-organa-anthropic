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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-secondary': '#F9FAFB',
          border: '#E2E8F0',
          'border-strong': '#CBD5E1',
          accent: '#4F6BED',
          'accent-hover': '#3D56D9',
          'accent-light': '#EEF2FF',
          text: '#1E293B',
          'text-secondary': '#64748B',
          'text-muted': '#94A3B8',
          muted: '#94A3B8',
          success: '#22C55E',
          'success-light': '#F0FDF4',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.04)',
        'modal': '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'button': '0 1px 2px rgba(0,0,0,0.08)',
        'input-focus': '0 0 0 3px rgba(0,113,227,0.18)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'typing-1': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
        'typing-2': {
          '0%, 10%, 70%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
        'typing-3': {
          '0%, 20%, 80%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.3s ease both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right': 'slide-right 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'typing-1': 'typing-1 1.2s ease infinite',
        'typing-2': 'typing-2 1.2s ease infinite',
        'typing-3': 'typing-3 1.2s ease infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'shimmer': 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
