/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        background: "#020617",
        surface: "#0f172a",
        border: "#1e293b",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
      }
    },
  },
  plugins: [],
}
