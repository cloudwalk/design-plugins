/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./Infinitepay-Design-System/**/*.{js,jsx,ts,tsx,css}",
  ],
  darkMode: ["class", "[data-mode='dark']"],
  theme: {
    extend: {
      colors: {
        'neutral-0': 'var(--color-neutral-0)',
        'neutral-50': 'var(--color-neutral-50)',
        'neutral-100': 'var(--color-neutral-100)',
        'neutral-200': 'var(--color-neutral-200)',
        'neutral-300': 'var(--color-neutral-300)',
        'neutral-400': 'var(--color-neutral-400)',
        'neutral-500': 'var(--color-neutral-500)',
        'neutral-600': 'var(--color-neutral-600)',
        'neutral-700': 'var(--color-neutral-700)',
        'neutral-750': 'var(--color-neutral-750)',
        'neutral-800': 'var(--color-neutral-800)',
        'neutral-850': 'var(--color-neutral-850)',
        'neutral-900': 'var(--color-neutral-900)',
        'neutral-1000': 'var(--color-neutral-1000)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-medium': 'var(--border-secondary)',
        'border-focus': 'var(--border-focus)',
        'surface-primary': 'var(--surface-primary)',
        'surface-secondary': 'var(--surface-secondary)',
      },
      fontFamily: {
        'content-secondary': ['Inter', 'sans-serif'],
        'content-secondary-medium': ['Inter', 'sans-serif'],
        'content-tertiary': ['Inter', 'sans-serif'],
        'content-tertiary-medium': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'md': 'var(--font-size-md)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
      },
      lineHeight: {
        'content': 'var(--line-height-content)',
        'heading': 'var(--line-height-heading)',
      },
      zIndex: {
        1000: '1000',
      },
    },
  },
  plugins: [],
};
