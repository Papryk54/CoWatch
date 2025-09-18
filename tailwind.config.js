/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: "#4282E8",
					accent: "#7E3FD5",
					dark: "#141C2E",
					bgc: "#0A0F1C",
				},
				alerts: {
					success: "#1BB28B",
					error: "#DA4D6E",
					warning: "#E6B84D",
				},
				text: { DEFAULT: "#DDDDDD", dark: "#222222" },
			},
			fontFamily: {
				rubik: ["Rubik-Regular", "sans-serif"],
				"rubik-bold": ["Rubik-Bold", "sans-serif"],
				"rubik-extrabold": ["Rubik-ExtraBold", "sans-serif"],
				"rubik-medium": ["Rubik-Medium", "sans-serif"],
				"rubik-semibold": ["Rubik-SemiBold", "sans-serif"],
				"rubik-light": ["Rubik-Light", "sans-serif"],
			},
		},
	},
	plugins: [],
};
