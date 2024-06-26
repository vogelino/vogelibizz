const plugin = require("tailwindcss/plugin");

const fallbackFonts = [
	"ui-sans-serif",
	"system-ui",
	"-apple-system",
	"BlinkMacSystemFont",
	"Segoe UI",
	"Roboto",
	"Helvetica Neue",
	"Arial",
	"Noto Sans",
	"sans-serif",
	"Apple Color Emoji",
	"Segoe UI Emoji",
	"Segoe UI Symbol",
	"Noto Color Emoji",
];

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class", '[data-theme="dark"]'],
	content: ["./src/**/*.{js,jsx,md,mdx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				special: ["var(--font-lobular)", ...fallbackFonts],
				sans: ["var(--font-fungis)", ...fallbackFonts],
				serif: ["serif"],
				mono: ["monospace"],
			},
			colors: {
				fg: "var(--fg)",
				bg: "var(--bg)",
				bgOverlay: "var(--bgOverlay)",
				alt: "var(--alt)",
				grayDark: "var(--grayDark)",
				grayMed: "var(--grayMed)",
				grayLight: "var(--grayLight)",
				grayUltraLight: "var(--grayUltraLight)",
			},
			height: { screen: "100lvh" },
			width: { screen: "100lvw" },
		},
	},
	plugins: [
		require("@tailwindcss/container-queries"),
		require("@tailwindcss/forms", { strategy: "class" }),
		require("tailwindcss-animate"),
		plugin(({ addUtilities }) => {
			addUtilities({
				".text-balance": {
					"text-wrap": "balance",
				},
				".text-pretty": {
					"text-wrap": "pretty",
				},
				".text-stroke-grayDark": {
					"-webkit-text-stroke-width": "5px",
					"-webkit-text-stroke-color": "var(--grayDark)",
				},
				".text-stroke-fg": {
					"-webkit-text-stroke-width": "5px",
					"-webkit-text-stroke-color": "var(--fg)",
				},
			});
		}),
	],
};
