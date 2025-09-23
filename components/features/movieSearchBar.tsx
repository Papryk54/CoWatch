import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export function MovieSearchBar() {
	const router = useRouter();

	async function handleSearch() {
		router.push({
			pathname: "/(root)/movieSearch/movieSearch",
		});
	}

	return (
		<View className="bg-brand-dark rounded-xl">
			<View className="flex-row rounded-xl">
				<Pressable
					onPress={handleSearch}
					className="text-text flex-1 border border-gray-300 rounded-lg p-2 mr-2"
				>
					<Text className="text-gray-400">Znajdź coś dla siebie...</Text>
				</Pressable>
			</View>
		</View>
	);
}
