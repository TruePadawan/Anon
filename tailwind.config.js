/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				"primary-color-1": "#111111",
				"primary-color-2": "#161616",
				"secondary-color": "#232323",
				"accent-color-1": "#3e3e3e",
				"accent-color-2": "#b3b3b3",
				"primary-color-1-l": "#282828",
				"primary-color-2-l": "#2D2D2D",
				"secondary-color-l": "#393939",
				"accent-color-1-l": "#515151",
				"accent-color-2-l": "#B9B9B9",
				"dark-red": "#8B0000",
				"dark-green": "#006400",
			},
			boxShadow: {
				"input-shadow": "inset 0px 2px 2px rgba(69, 69, 69, 0.25)",
			},
		},
	},
	plugins: [],
};
