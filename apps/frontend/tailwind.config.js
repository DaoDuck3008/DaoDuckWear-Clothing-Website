export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        editorial: {
          background: "#f9f9f9",
          surface: "#f3f3f3",
          high: "#e8e8e8",
          highest: "#e2e2e2",
          primary: "#000000",
          accent: "#b91446",
        },
      },
    },
  },
};
