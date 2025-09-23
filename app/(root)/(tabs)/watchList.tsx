import { WatchListDefault } from "@/components/layout/watchListDefault";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const WatchList = () => {
	const router = useRouter();

	const userWatchlists = [
		{ id: "1", name: "Watchlist 1", itemCount: 1 },
		{ id: "2", name: "Watchlist 2", itemCount: 12 },
		{ id: "4", name: "Watchlist 4", itemCount: 80 },
		{ id: "3", name: "Watchlist 3", itemCount: 45 },
		{ id: "5", name: "Watchlist 5", itemCount: 100 },
	]; // Placeholder data for user watchlists

	const data = [
		<View
			key="header"
			className="flex-row justify-start gap-2 items-center mb-4"
		>
			<Text className="text-text font-bold text-2xl">Moje listy</Text>
			<Pressable
				onPress={() => router.push("/(root)/watchListMaker/watchListMaker")}
				className="border-b border-brand-accent mb-2"
			>
				<Text className="text-white/30 text-sm font-rubik-light">
					Stwórz nową
				</Text>
			</Pressable>
		</View>,
		<View key="lists" className="flex-row flex-wrap gap-2 mb-4">
			{userWatchlists.map((list) => {
				const fontSize = Math.min(12 + list.itemCount * 0.1, 22); 
				return (
					<View
						key={list.id}
						className="bg-gray-800 px-4 py-2 rounded-lg"
						style={{ alignSelf: "flex-start" }}
					>
						<Text className="text-white font-medium" style={{ fontSize }}>
							{list.name} ({list.itemCount})
						</Text>
					</View>
				);
			})}
		</View>,
		<View key="default" className="mt-2">
			<WatchListDefault orientation="vertical" />
		</View>,
	];

	return (
		<View className="flex-1 bg-brand-bgc h-full p-4">
			<FlatList
				data={data}
				renderItem={({ item }) => item}
				keyExtractor={(item, index) => `flatlist-item-${index}`}
				className="mb-14"
			/>
		</View>
	);
};

export default WatchList;
