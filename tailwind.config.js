/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				// 1️⃣ Różowo-bordowy
				// brand: {
				// 	DEFAULT: "#E23E57",
				// 	accent: "#88304E",
				// 	dark: "#522546",
				// 	bgc: "#311D3F",
				// },
				// alerts: {
				// 	success: "#2ecc71",
				// 	error: "#c0392b",
				// },

				// 2️⃣ Neon-turkus X
				// brand: {
				// 	DEFAULT: "#14FFEC",
				// 	accent: "#0D7377",
				// 	dark: "#323232",
				// 	bgc: "#212121",
				// },
				// alerts: {
				// 	success: "#00e676",
				// 	error: "#ff1744",
				// },

				// 3️⃣ Fioletowo-bordowy X
				// brand: {
				// 	DEFAULT: "#A64D79",
				// 	accent: "#6A1E55",
				// 	dark: "#3B1C32",
				// 	bgc: "#1A1A1D",
				// },
				// alerts: {
				// 	success: "#27ae60",
				// 	error: "#e74c3c",
				// },

				// 4️⃣ Beżowo-szaro-różowy
				// brand: {
				// 	DEFAULT: "#ED8D8D",
				// 	accent: "#8D6262",
				// 	dark: "#4D4545",
				// 	bgc: "#393232",
				// },
				// alerts: {
				// 	success: "#55efc4",
				// 	error: "#d63031",
				// },

				// 5️⃣ Oceaniczny niebieski WINNER
				brand: {
					DEFAULT: "#3A86FF", // mocny niebieski
					accent: "#8338EC", // fioletowy akcent
					dark: "#14213D", // granat
					bgc: "#0B132B", // ciemne tło
				},
				alerts: {
					success: "#06D6A0", // turkusowa zieleń
					error: "#EF476F", // malinowa czerwień
				},

				// 6️⃣ Ziemisto-oliwkowy
				// brand: {
				//   DEFAULT: "#BC6C25", // rdzawy brąz
				//   accent: "#DDA15E",  // piaskowy złoty
				//   dark: "#283618",    // oliwkowa zieleń
				//   bgc: "#1D2D2A",     // ciemna zieleń
				// },
				// alerts: {
				//   success: "#8AC926", // jaskrawa limonka
				//   error: "#FF595E",   // mocna koralowa czerwień
				// },

				// DEFAULT ALERTS
				// alerts: { success: "#00b894", error: "#d63031" },
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
