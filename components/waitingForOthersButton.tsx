import React from "react";
import { Pressable, Text } from "react-native";

export default function WaitingForOthersButton() {
	return (
		<Pressable
			onPress={() => {
				console.log("Waiting for others...");
			}}
			className="bg-gray-500 px-4 py-1 rounded"
		>
			<Text className="text-white font-rubik-medium">
				Oczekiwanie na innych...
			</Text>
		</Pressable>
	);
}
