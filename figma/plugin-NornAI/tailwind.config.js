/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background': {
          primary: 'var(--bg-color)',
          secondary: 'var(--input-bg)',
          tertiary: 'var(--result-box-bg)',
        },
        'surface': {
          primary: 'var(--result-box-bg)',
          secondary: 'var(--input-bg)',
        },
        'border': {
          primary: 'var(--border-color)',
          secondary: 'var(--border-color)',
          focus: 'var(--text-color)',
        },
        'text': {
          primary: 'var(--text-color)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-secondary)',
          inverse: 'var(--bg-color)',
        },
        'brand': {
          primary: 'var(--text-color)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-secondary)',
        },
        'accent': {
          success: 'var(--color-accent-success)',
          warning: 'var(--color-accent-warning)',
          error: 'var(--color-accent-error)',
          info: 'var(--color-accent-info)',
        },
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'md': '13px',
        'lg': '14px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': 'var(--box-shadow)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.3)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '100px',
      },
      animation: {
        'flame': 'flame 2s infinite',
        'floating': 'floating-flames 3s ease-in-out infinite',
      },
      keyframes: {
        flame: {
          '0%, 100%': { boxShadow: 'var(--inferno-glow)' },
          '50%': { boxShadow: 'var(--inferno-intense-glow)' },
        },
        'floating-flames': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
