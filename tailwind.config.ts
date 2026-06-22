import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        pixel: "0 5px 0 #111827",
        soft: "0 16px 50px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        pixel: ["Courier New", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
