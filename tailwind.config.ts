import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    {
      pattern:
        /^(bg|text|border|ring)-(red|green|blue|gray|yellow)-(50|100|200|400|500|600|700)$/,
    },
    "animate-shake",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        shake: {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "15%": { transform: "translateX(-3px) rotate(-1deg)" },
          "30%": { transform: "translateX(3px) rotate(1deg)" },
          "45%": { transform: "translateX(-3px) rotate(-1deg)" },
          "60%": { transform: "translateX(3px) rotate(1deg)" },
          "75%": { transform: "translateX(-3px) rotate(-1deg)" },
          "100%": { transform: "translateX(0) rotate(0deg)" },
        },
      },
      animation: {
        shake: "shake 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
