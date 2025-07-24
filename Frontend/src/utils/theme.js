const theme = {
  colors: {
    primary: {
      main: "#1B3C53", // Navy Blue for buttons, accents
      light: "#456882", // Mid Blue for hover states
      dark: "#132D40", // Darker Navy for active states
    },
    secondary: {
      main: "#FFFFFF", // Soft Beige for headers, navbars 
      light: "#E0D5CC", // Lighter Beige
      dark: "#B8A79B", // Darker Beige
    },
    background: {
      main: "#FFFFFF", // White for page backgrounds
      card: "#F9F3EF", // Light Cream for cards, forms
    },
    text: {
      primary: "#1B3C53", // Navy Blue for main text
      secondary: "#6B7280", // Medium Gray for secondary text
    },
    accent: {
      success: "#059669", // Green for success
      error: "#DC2626", // Red for errors
      warning: "#D97706", // Yellow for warnings
    },
  },
  fonts: {
    primary: ["Montserrat", "sans-serif"],
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
};

export default theme;
