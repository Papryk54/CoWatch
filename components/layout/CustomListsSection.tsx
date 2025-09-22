import { WatchlistItem } from "@/lib/tmdb";
import React from "react";
import { Text, View } from "react-native";
import { MovieGrid } from "./movieGrid";

const CustomListsSection = ({ items }: { items: WatchlistItem[] }) => {
	const shown = items.slice(0, 6);

	return (
		<View>
			{shown.map((item) => (
				<View key={item.tmdb.id} className="mb-6">
					<Text className="font-rubik-semibold text-text text-xl mb-2">
						{item.tmdb.title}
					</Text>
					<MovieGrid
						data={shown}
						loading={false}
						orientation="horizontal"
						imagePlaceholder
					/>
				</View>
			))}
		</View>
	);
};

export default CustomListsSection;
