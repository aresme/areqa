/** Areqa design tokens — shared by store and admin. Colors resolve to CSS variables in tokens.css. */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: token('ink'),
        paper: token('paper'),
        mist: token('mist'),
        line: token('line'),
        muted: token('muted'),
        mint: {
          DEFAULT: token('mint'),
          strong: token('mint-strong'),
          deep: token('mint-deep'),
        },
        danger: {
          DEFAULT: token('danger'),
          deep: token('danger-deep'),
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.5rem, 6vw + 1rem, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        display: [
          'clamp(1.75rem, 3vw + 0.75rem, 3rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em' },
        ],
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.14em' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      maxWidth: {
        content: '1280px',
      },
      aspectRatio: {
        product: '4 / 5',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 11 11 / 0.04), 0 8px 24px rgb(11 11 11 / 0.06)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
};
