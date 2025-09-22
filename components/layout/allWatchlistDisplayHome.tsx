import { getCustomWatchlists } from "@/lib/appwrite/appwriteWatchlist";
import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import CustomListsSection from "./CustomListsSection";
import { WatchList } from "./watchList";
import { PopularMoviesGrid } from "./popularMoviesGrid";

const AllWatchlistDisplayHome = () => {
	const [defaultWatchlistMovies, setDefaultWatchlistMovies] = useState<
		WatchlistItem[]
	>([]);
	const [defaultWatchlistTV, setDefaultWatchlistTV] = useState<WatchlistItem[]>(
		[]
	);
	const [selectedCustomWatchlist, setSelectedCustomWatchlist] = useState<
		WatchlistItem[]
	>([]);
	const [selectedType, setSelectedType] = useState<"movie" | "tv">("movie");

	const load = async () => {
		const customWatchlists = await getCustomWatchlists();
		const defaultWatchlistMovies = await getMergedDBandTMDBItems({
			type: "movie",
			action: "find",
		});
		const defaultWatchlistTV = await getMergedDBandTMDBItems({
			type: "tv",
			action: "find",
		});
		setDefaultWatchlistMovies(
			Array.isArray(defaultWatchlistMovies)
				? defaultWatchlistMovies
				: defaultWatchlistMovies.results || []
		);
		setDefaultWatchlistTV(
			Array.isArray(defaultWatchlistTV)
				? defaultWatchlistTV
				: defaultWatchlistTV.results || []
		);
		if (customWatchlists.length > 0) {
			setSelectedCustomWatchlist(customWatchlists[0].watchListItems || []);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<View className="px-4 pt-2 pb-10 flex-1 bg-brand-bgc">
			<WatchList orientation="horizontal" />
			<CustomListsSection items={selectedCustomWatchlist} />
			<View className="flex-row mt-6">
				<Pressable
					onPress={() => setSelectedType("movie")}
					className={`px-4 py-2 rounded-xl mr-2 ${selectedType === "movie" ? "bg-brand" : "bg-gray-700"}`}
				>
					<Text className="text-white">Filmy</Text>
				</Pressable>
				<Pressable
					onPress={() => setSelectedType("tv")}
					className={`px-4 py-2 rounded-xl ${selectedType === "tv" ? "bg-brand" : "bg-gray-700"}`}
				>
					<Text className="text-white">Seriale</Text>
				</Pressable>
			</View>
			<PopularMoviesGrid orientation="vertical" type={selectedType} />
		</View>
	);
};

export default AllWatchlistDisplayHome;
