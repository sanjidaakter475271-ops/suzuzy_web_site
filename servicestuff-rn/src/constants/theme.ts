export const COLORS = {
  // Brand Colors
  primary: "#1e40af",
  primaryDark: "#1e3a8a",
  primaryLight: "#3b82f6",

  // Neutral Colors
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  slate950: "#020617",

  // Semantic - Page & Surface
  pageBg: "#020617",
  cardBg: "#0d1326",
  cardBgAlt: "rgba(15, 23, 42, 0.4)",
  headerBg: "rgba(13, 19, 38, 0.85)",
  tabBarBg: "#0f172a",
  inputBg: "#131b2f",
  primarySurface: "rgba(30, 58, 138, 0.2)",

  // Semantic - Text
  textPrimary: "#FFFFFF",
  textSecondary: "#94a3b8",
  textTertiary: "#64748b",
  textOnHeader: "#FFFFFF",
  textOnPrimary: "#FFFFFF",

  // Semantic - Border
  border: "#1e293b",
  borderStrong: "#334155",
  divider: "rgba(30, 41, 59, 0.5)",

  // Status Colors (adjusted for dark bg readability)
  success: "#22c55e",
  successBg: "rgba(34, 197, 94, 0.1)",
  warning: "#eab308",
  warningBg: "rgba(234, 179, 8, 0.1)",
  danger: "#ef4444",
  dangerBg: "rgba(239, 68, 68, 0.1)",
  info: "#3b82f6",
  infoBg: "rgba(59, 130, 246, 0.1)",

  // Specific Backgrounds
  darkPage: "#0a0f1c",
  darkCard: "#0d1326",
  darkInput: "#131b2f",
  darkBorder: "rgba(30, 41, 59, 0.5)",

  // Accent Color (Premium Orange)
  accent: "#f97316",
  accentSurface: "rgba(249, 115, 22, 0.15)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  full: 9999,
};

export const TYPOGRAPHY = {
  // Sizes
  sizes: {
    xxs: 10,
    xs: 11,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 30,
  },
  // Font Families (using M PLUS Rounded 1c mapped in tailwind.config.js)
  families: {
    regular: "MPLUSRounded1c_400Regular",
    medium: "MPLUSRounded1c_400Regular", // Mapped to regular to save space
    bold: "MPLUSRounded1c_700Bold",
    black: "MPLUSRounded1c_700Bold", // Mapped to bold to save space
  }
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
};
