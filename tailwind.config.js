// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    {
      // Keep any bg-<color>-<shade>, text-<color>-<shade>, border-<color>-<shade>
      pattern: /(bg|text|border)-[a-z]+-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      // Keep gradient-, from-<color>-<shade>, to-<color>-<shade> classes
      pattern: /(bg-gradient-to-(r|l|t|b)|from-[a-z]+-(50|100|200|300|400|500|600|700|800|900)|to-[a-z]+-(50|100|200|300|400|500|600|700|800|900))/,
    },
  ],
  theme: {
    extend: {
      // (Optional) If you want to override any default green shades, do so here.
      // Otherwise Tailwind’s default green-400/600/800 all exist by default.
      // colors: {
      //   green: {
      //     400: "#34d399",
      //     600: "#059669",
      //     800: "#065f46",
      //   },
      // },
    },
  },
  plugins: [],
};
