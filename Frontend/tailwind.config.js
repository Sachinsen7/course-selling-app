import theme from "./src/utils/theme";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
      spacing: {
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
        xl: theme.spacing.xl,
      },
    },
  },
  plugins: [],
};
