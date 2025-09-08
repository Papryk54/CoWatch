import { ensureMyProfile, login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import React from "react";
import {
	Alert,
	Image,
	ImageBackground,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const SignIn = () => {
	const { refetch } = useGlobalContext();
	const images = {
		background: require("../assets/images/SigninBackground.png"),
	};
	const handleLogin = async () => {
		const result = await login();
		if (result) {
			refetch();
			router.replace("/");
		} else {
			Alert.alert("Error", "Failed to login");
		}
	};
	return (
		<ImageBackground source={images.background} resizeMode="cover">
			<View className="h-full bg">
				<Text className="text-text text-center mt-12 font-rubik-bold text-3xl">
					CoWatch
				</Text>
				<TouchableOpacity
					onPress={handleLogin}
					className="absolute bottom-12 left-12 right-12 bg-brand shadow-md shadow-brand-accent rounded-full py-4"
				>
					<View className="flex flex-row items-center justify-center">
						<Image
							source={require("../assets/icons/login.png")}
							className="w-10 h-10"
							resizeMode="contain"
						/>
						<Text className="text-lg text-text-dark font-rubik-medium text-black-300 ml-2">
							Sign-in
						</Text>
					</View>
				</TouchableOpacity>
			</View>
		</ImageBackground>
	);
};

export default SignIn;
