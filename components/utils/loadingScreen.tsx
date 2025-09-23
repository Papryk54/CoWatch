import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const LoadingScreen: React.FC = () => (
	<View className="absolute top-0 left-0 z-50 w-[100%] h-[100%] flex align-middle justify-center items-center bg-brand-bgc">
		<ActivityIndicator size={40} className="text-brand" />
		<Text className="text-text">Proszę czekać...</Text>
	</View>
);

export default LoadingScreen;
