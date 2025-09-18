import { addToWatchlist, getMyProfile } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

const MovieActionButtons = ({ movieId }: { movieId: number }) => {
	const [profile, setProfile] = useState<any | null>(null);

	useEffect(() => {
		(async () => {
			const p = await getMyProfile();
			setProfile(p);
		})();
	}, []);

	const handleAddToWatchlist = () => {
		addToWatchlist(profile.watchlist_main.$id, movieId);
	};

	return (
		<View className="flex-row w-full items-center gap-9 bg-transparent px-9">
			<Pressable
				className="flex-1 flex-row items-center justify-center px-5 active:opacity-80 "
				onPress={handleAddToWatchlist}
			>
				<Image
					source={require("@/assets/icons/watchList.png")}
					className="w-12 h-12"
				/>
				<Text className="text-white h-full text-center text-lg font-rubik-light ">
					Dodaj
				</Text>
			</Pressable>

			<Pressable
				className="flex-1 flex-row items-center justify-center px-5 active:opacity-80"
				onPress={() => console.log("Reviewed!")}
			>
				<Image
					source={require("@/assets/icons/rating.png")}
					className="w-12 h-12"
				/>
				<Text className="text-text font-rubik-bold">Oceń</Text>
			</Pressable>
		</View>
	);
};

export default MovieActionButtons;
