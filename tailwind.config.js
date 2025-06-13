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
    // Add shadow safelist for glow effects
    {
      pattern: /shadow-[a-z]+-[0-9]+\/[0-9]+/,
    }
  ],
  theme: {
    extend: {
      animation: {
        blob: 'blob 15s infinite',
        float: 'float 8s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
            borderRadius: '50% 60% 70% 40% / 40% 60% 30% 60%',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
            borderRadius: '40% 60% 30% 70% / 50% 60% 70% 30%',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      transitionDelay: {
        '1500': '1500ms',
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
      },
      animationDelay: {
        '1000': '1s',
        '2000': '2s',
        '3000': '3s',
        '4000': '4s',
      }
    },
  },
  plugins: [],
};