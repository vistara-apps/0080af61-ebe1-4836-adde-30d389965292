import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        fg: 'var(--color-fg)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        'text-muted': 'var(--color-text-muted)',
        'accent-hover': 'var(--color-accent-hover)',
        'primary-hover': 'var(--color-primary-hover)',
        'surface-hover': 'var(--color-surface-hover)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      boxShadow: {
        'card': '0 4px 20px hsla(240, 10%, 3%, 0.4)',
        'glow': '0 0 24px hsla(142, 76%, 36%, 0.3)',
        'widget': '0 8px 32px hsla(240, 10%, 3%, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
