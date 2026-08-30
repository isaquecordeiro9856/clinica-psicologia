import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--ring)',
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-fg)' },
        secondary: { DEFAULT: 'var(--bg-subtle)', foreground: 'var(--fg)' },
        destructive: { DEFAULT: 'var(--danger)', foreground: '#ffffff' },
        muted: { DEFAULT: 'var(--bg-subtle)', foreground: 'var(--fg-muted)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-fg)' },
        popover: { DEFAULT: 'var(--surface)', foreground: 'var(--fg)' },
        card: { DEFAULT: 'var(--surface)', foreground: 'var(--fg)' },
        success: { DEFAULT: 'var(--success)', foreground: '#ffffff' },
        warning: { DEFAULT: 'var(--warning)', foreground: '#ffffff' },
        info: { DEFAULT: 'var(--info)', foreground: '#ffffff' },
        violet: { DEFAULT: 'var(--violet)', foreground: '#ffffff' },
        indigo: { DEFAULT: 'var(--indigo)', foreground: '#ffffff' },
        teal: { DEFAULT: 'var(--teal)', foreground: '#ffffff' },
        rose: { DEFAULT: 'var(--rose)', foreground: '#ffffff' },
        amber: { DEFAULT: 'var(--amber)', foreground: '#ffffff' },
        emerald: { DEFAULT: 'var(--emerald)', foreground: '#ffffff' },
        sky: { DEFAULT: 'var(--sky)', foreground: '#ffffff' },
        slate: { DEFAULT: 'var(--slate)', foreground: '#ffffff' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [animatePlugin],
};
export default config;
