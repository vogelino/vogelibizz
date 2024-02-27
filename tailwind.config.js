/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      ringColor: (theme) => ({
        DEFAULT: theme("colors.grey.500"),
      }),
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
