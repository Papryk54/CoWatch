import { Card } from "@/components/cards";
import { login } from "@/lib/appwrite";
import React, { useState } from "react";
import {
	Alert,
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);

	const handleSuccess = () => {
		if (showSuccess) {
			setShowSuccess(false);
		} else {
			setShowSuccess(true);
		}
	};
	const handleError = () => {
		if (showError) {
			setShowError(false);
		} else {
			setShowError(true);
		}
	};

	const handleLogin = async () => {
		const result = await login();
		if (result) {
			// refetch(); - odkomentuj po teście
			console.log("Login Success"); // usuń po teście
		} else {
			Alert.alert("Error", "Failed to login");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-brand-bgc">
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 pt-2 pb-10"
				showsVerticalScrollIndicator={false}
			>
				<Text className="font-rubik-extrabold text-text text-2xl text-center">
					CoWatch
				</Text>
				<View className="flex-row gap-4 justify-center mt-4">
					<TouchableOpacity
						onPress={handleSuccess}
						className="bg-alerts-success px-3 py-2 rounded-xl flex-1"
					>
						<Text className="font-rubik-semibold text-text-dark text-center">
							Success
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleError}
						className="bg-alerts-error px-3 py-2 rounded-xl flex-1"
					>
						<Text className="font-rubik-semibold text-text text-center">
							Error
						</Text>
					</TouchableOpacity>
				</View>

				<View className="mt-4 flex-row gap-2">
					<TouchableOpacity className="bg-brand px-3 py-2 rounded-xl">
						<Text className="font-rubik-semibold text-text-dark">Primary</Text>
					</TouchableOpacity>
					<TouchableOpacity className="bg-brand-accent px-3 py-2 rounded-xl">
						<Text className="font-rubik-semibold text-text">Accent</Text>
					</TouchableOpacity>
					<TouchableOpacity className="bg-brand-dark px-3 py-2 rounded-xl">
						<Text className="font-rubik-semibold text-text">Dark</Text>
					</TouchableOpacity>
				</View>
				{showSuccess && (
					<View className="mt-3 rounded-xl px-4 py-3 bg-alerts-success">
						<Text className="font-rubik-semibold text-text-dark">
							To jest pasek sukcesu
						</Text>
					</View>
				)}
				{showError && (
					<View className="mt-2 rounded-xl px-4 py-3 bg-alerts-error">
						<Text className="font-rubik-semibold text-text">
							To jest pasek błędu
						</Text>
					</View>
				)}

				<View className="mt-3">
					<TextInput
						placeholder="Szukaj…"
						placeholderTextColor="#DDDDDD88"
						className="bg-brand-dark rounded-xl px-4 py-3 font-rubik text-text"
					/>
				</View>

				<View className="mt-4">
					<Text className="font-rubik-semibold text-text">
						Popularne filmy:
					</Text>
				</View>

				<Card />

				<View className="mt-4 rounded-2xl bg-brand-dark p-4">
					<Text className="font-rubik-semibold text-text">Sekcja testowa</Text>
					<Text className="font-rubik text-text/80 mt-1">
						Kontrasty, spacing i fonty.
					</Text>
				</View>
				<TouchableOpacity
					onPress={handleLogin}
					className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
				>
					<View className="flex flex-row items-center justify-center">
						<Image
							source={require("../../../assets/icons/login.png")}
							className="w-5 h-5"
							resizeMode="contain"
						/>
						<Text className="text-lg font-rubik-medium text-black-300 ml-2">
							Continue with Google
						</Text>
					</View>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Index;
