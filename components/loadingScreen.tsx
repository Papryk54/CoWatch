import React from "react";
import { Text, View } from "react-native";

const LoadingScreen: React.FC = () => (
	<View className="absolute z-20 justify-center items-center bg-brand-bgc w-screen h-screen flex-1">
		<Text className="text-white text-4xl font-bold tracking-wider font-rubik-bold">
			CoWatch
		</Text>
	</View>
);

export default LoadingScreen;
