import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		"Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
		"Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
		"Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
		"Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
		"Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
		"Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	useEffect(() => {
		NavigationBar.setVisibilityAsync("hidden");
	}, []);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<>
			<StatusBar hidden />
			<Stack screenOptions={{ headerShown: false }} />
		</>
	);
}
