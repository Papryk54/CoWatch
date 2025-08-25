import React from "react";
import { ImageBackground, Text, View } from "react-native";

const SignIn = () => {
	const images = {
		background: require("../assets/images/SigninBackground.png"),
	};
	return (
		<ImageBackground source={images.background} resizeMode="cover">
			<View className="h-full bg">
				<Text className="text-text text-center justify-center mt-48 font-rubik-bold text-3xl">
					CoWatch
				</Text>
			</View>
		</ImageBackground>
	);
};

export default SignIn;
