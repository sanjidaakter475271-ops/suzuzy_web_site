export const chartTheme = {
    colors: {
        primary: "#D4AF37",    // Champagne Gold
        secondary: "#DC2626",  // Racing Red
        tertiary: "#F8F8F8",   // Pearl White
        background: "#0D0D0F", // Deep Charcoal
        grid: "#ffffff10",     // Low opacity white for grids
        text: {
            primary: "#F8F8F8",
            secondary: "#A1A1AA",
        },
        gradients: {
            gold: ["#D4AF37", "#A6851F"],
            red: ["#DC2626", "#991B1B"],
            dark: ["#1A1A1C", "#0D0D0F"],
        },
    },
    typography: {
        fontFamily: "var(--font-dmsans)",
        fontSize: 12,
    },
    animation: {
        duration: 1500,
        easing: "ease-out",
    },
};

export const customTooltipStyle = {
    backgroundColor: "#0D0D0F",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
};
