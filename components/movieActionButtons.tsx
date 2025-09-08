import { addToWatchlist, ensureMyProfile } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

const MovieActionButtons = ({ movieId }: { movieId: number }) => {
	const [profile, setProfile] = useState<any | null>(null);

	useEffect(() => {
		(async () => {
			const p = await ensureMyProfile();
			setProfile(p);
		})();
	}, []);

	const handleAddToWatchlist = () => {
		console.log("Dodawanie do listy obserwowanych");
		console.log("Movie ID:", movieId);
		console.log("Profile:", profile.watchList[0].$id);
		addToWatchlist(profile.watchList[0].$id, movieId);
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
				onPress={() => console.log("ocena filmu")}
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
