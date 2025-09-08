import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const GroupPhase = () => {
	const [rankings, setRankings] = useState<{ [key: number]: number }>({});
	const [order, setOrder] = useState(1);

	const handleSelect = (id: number) => {
		if (rankings[id]) return;
		setRankings((prev) => ({ ...prev, [id]: order }));
		setOrder((prev) => prev + 1);
	};

	const handleReset = () => {
		setRankings({});
		setOrder(1);
	};

	const TMDB = {
		base: "https://api.themoviedb.org/3",
		img: (
			path?: string | null,
			size: "w300" | "w500" | "w780" | "original" = "w500"
		) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined),
		headers: {
			Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_KEY}`,
			"Content-Type": "application/json;charset=utf-8",
		} as HeadersInit,
	};

	const allSelected = Object.keys(rankings).length === 4;

	const handleNext = () => {
		if (!allSelected) return;
		console.log("NEXT →", rankings);
	};

	return (
		<View className="flex-1 bg-brand-bgc items-center justify-center h-screen">
			<Text className="font-rubik-extrabold text-text text-xl text-center mb-4">
				1 / 3
			</Text>

			<View className="flex-1 items-center justify-center mt-24">
				<View className="flex-1 flex-row flex-wrap justify-between">
					{[1, 2, 3, 4].map((i) => (
						<Pressable
							key={i}
							onPress={() => handleSelect(i)}
							className="w-[48%] h-[40%] bg-brand-dark rounded-2xl items-center justify-center mb-4 relative"
						>
							<Text className="font-rubik text-text text-lg">Karta {i}</Text>

							{rankings[i] && (
								<View className="absolute inset-0 bg-black/60 rounded-2xl items-center justify-center">
									<Text className="font-rubik-extrabold text-4xl text-white">
										{rankings[i]}
									</Text>
								</View>
							)}
						</Pressable>
					))}
				</View>
			</View>

			<View className="flex-row items-center justify-between px-2 py-4 mb-4">
				<Pressable
					onPress={handleReset}
					className="bg-alerts-error rounded-2xl w-14 h-14 items-center justify-center mr-3"
				>
					<Ionicons name="arrow-undo" size={24} color="#fff" />
				</Pressable>

				<Pressable
					disabled={!allSelected}
					onPress={handleNext}
					className={`flex-1 rounded-2xl py-4 items-center ${
						allSelected ? "bg-brand" : "bg-brand-dark opacity-60"
					}`}
				>
					<Text className="font-rubik-extrabold text-lg text-text">Dalej</Text>
				</Pressable>
			</View>
		</View>
	);
};

export default GroupPhase;
