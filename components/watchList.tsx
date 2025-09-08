import { MovieGrid } from "@/components/movieGrid";
import { getMyProfile, getWatchlistItems } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { Movie } from "./movieTile";

export function WatchList(props: { orientation?: "vertical" | "horizontal" }) {
	const [loading, setLoading] = useState(true);
	const [movies, setMovies] = useState<Movie[]>([]);
	const { refetch } = useGlobalContext();

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

	useEffect(() => {
		getProfile();
	}, []);

	const getProfile = async () => {
		const me = await getMyProfile();
		const myWatchlistId = me.watchList[0].$id;
		const myWatchlistItems = await getWatchlistItems(myWatchlistId);
		const items = myWatchlistItems.documents.map((item: any) => item.tmdb_id);
		await getMoviesByIds(items);
	};

	async function getMoviesByIds(ids: number[]) {
		const promises = ids.map((id) =>
			fetch(
				`${TMDB.base}/movie/${id}?language=pl-PL&append_to_response=release_dates`,
				{ headers: TMDB.headers }
			)
				.then((res) => res.json())
				.then((data) => {
					setMovies((prev) => Array.from(new Set([...prev, data])));
					return data;
				})
		);
		setLoading(false);
		return Promise.all(promises);
	}

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
