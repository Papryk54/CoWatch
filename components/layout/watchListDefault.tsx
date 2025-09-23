import { getMyProfile } from "@/lib/appwrite";
import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { MovieGrid } from "./movieGrid";

export function WatchListDefault(props: {
	orientation?: "vertical" | "horizontal";
}) {
	const [movies, setMovies] = useState<WatchlistItem[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			await getWatchlist();
		};

		fetchData();
	}, []);

	const getWatchlist = async () => {
		try {
			const me = await getMyProfile();
			const myWatchlistId = me.watchlist_main.$id;
			const merged = await getMergedDBandTMDBItems({
				type: "movie",
				action: "find",
				watchlistId: myWatchlistId,
			});
			setMovies(Array.isArray(merged) ? merged : []);
		} catch (e) {
			console.log("ERROR occurs in getWatchlist: ", e);
		}
	};

	return (
		<>
			<Text className="font-rubik-semibold text-text text-xl mt-6 mb-2">
				Do obejrzenia:
			</Text>
			<MovieGrid
				data={movies}
				loading={!movies.length}
				orientation={props.orientation}
			/>
		</>
	);
}
