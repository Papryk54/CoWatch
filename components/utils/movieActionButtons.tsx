import { getMyProfile } from "@/lib/appwrite";
import {
	addToWatchlist,
	getWatchlistItems,
} from "@/lib/appwrite/appwriteWatchlist";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

const MovieActionButtons = ({ movieId }: { movieId: number }) => {
	const [profile, setProfile] = useState<any | null>(null);
	const [isAdded, setIsAdded] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			const p = await getMyProfile();
			const moviesIds = await getWatchlistItems(p.watchlist_main.$id);
			console.log("moviesIds: ", moviesIds[0].$id);
			const isAdded = moviesIds.some((item) => item.tmdb_id === movieId);
			console.log("isAdded: ", isAdded);
			setProfile(p);
			setIsAdded(isAdded);
			setLoading(false);
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
				{loading && (
					<>
						<ActivityIndicator />
					</>
				)}
				{!isAdded && !loading && (
					<>
						<Image
							source={require("@/assets/icons/watchList.png")}
							className="w-12 h-12"
						/>
						<Text className="text-white h-full text-center text-lg font-rubik-light ">
							Dodaj
						</Text>
					</>
				)}
				{isAdded && !loading && (
					<>
						<Image
							source={require("@/assets/icons/added.png")}
							className="w-12 h-12 color-white"
						/>
						<Text className="text-white h-full text-center text-lg font-rubik-light ">
							Dodano
						</Text>
					</>
				)}
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
