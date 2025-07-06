import theme from "./src/utils/theme"
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-background-main',
    'bg-secondary-dark',
    'text-background-card',
    'p-spacing-md',
    'mt-spacing-lg',
    'space-x-spacing-md',
    'mt-spacing-sm',
    'hover:text-primary-light'
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        background: theme.colors.background,
        text: theme.colors.text,
        accent: theme.colors.accent,
      },
      fontFamily: {
        sans: theme.fonts.primary,
      },
      spacing: theme.spacing,
    },
  },
  plugins: [],
};
