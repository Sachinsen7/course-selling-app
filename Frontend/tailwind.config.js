// tailwind.config.js
const theme = require('./src/utils/theme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
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