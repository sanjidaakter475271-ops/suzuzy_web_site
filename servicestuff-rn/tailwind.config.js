/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["MPLUSRounded1c_400Regular"],
        mplus: ["MPLUSRounded1c_400Regular"],
        "mplus-thin": ["MPLUSRounded1c_100Thin"],
        "mplus-light": ["MPLUSRounded1c_300Light"],
        "mplus-medium": ["MPLUSRounded1c_500Medium"],
        "mplus-bold": ["MPLUSRounded1c_700Bold"],
        "mplus-extrabold": ["MPLUSRounded1c_800ExtraBold"],
        "mplus-black": ["MPLUSRounded1c_900Black"],
        // Standard weight mappings for easier use
        thin: ["MPLUSRounded1c_100Thin"],
        light: ["MPLUSRounded1c_300Light"],
        normal: ["MPLUSRounded1c_400Regular"],
        medium: ["MPLUSRounded1c_500Medium"],
        bold: ["MPLUSRounded1c_700Bold"],
        extrabold: ["MPLUSRounded1c_800ExtraBold"],
        black: ["MPLUSRounded1c_900Black"],
      },
      colors: {
        primary: "#1e40af",
        background: "#F0F2F5",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
      }
    },
  },
  plugins: [],
}
