import { getMyProfile } from "@/lib/appwrite";
import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { MovieGrid } from "./movieGrid";

export function WatchList(props: { orientation?: "vertical" | "horizontal" }) {
	const [loading, setLoading] = useState(true);
	const [movies, setMovies] = useState<WatchlistItem[]>([]);

	useEffect(() => {
		getWatchlist();
	}, []);

	const getWatchlist = async () => {
		try {
			const me = await getMyProfile();
			const myWatchlistId = me.watchlist_main.$id;
			setLoading(true);
			const merged = await getMergedDBandTMDBItems(
				{ type: "movie", action: "find" },
				myWatchlistId
			);
			setMovies(Array.isArray(merged) ? merged : []);
		} catch (e) {
			console.log("ERROR occurs in getWatchlist: ", e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Text className="font-rubik-semibold text-text text-xl mt-6 mb-2">
				Do obejrzenia:
			</Text>
			<MovieGrid
				data={movies}
				loading={loading}
				orientation={props.orientation ?? "vertical"}
			/>
		</>
	);
}
