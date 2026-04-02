export const COLORS = {
  // Brand Colors
  primary: "#3b82f6",
  primaryDark: "#2563eb",
  primaryLight: "#60a5fa",

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

  // Status Colors
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
    medium: "MPLUSRounded1c_500Medium",
    bold: "MPLUSRounded1c_700Bold",
    black: "MPLUSRounded1c_900Black",
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
