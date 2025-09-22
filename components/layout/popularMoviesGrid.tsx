import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { MovieGrid } from "./movieGrid";

export function PopularMoviesGrid(props: {
	orientation?: "vertical" | "horizontal";
	type: "movie" | "tv";
}) {
	const [data, setData] = useState<WatchlistItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getMergedDBandTMDBItems({ type: props.type, action: "popular", page: 1 })
			.then((res) => {
				const mapped = Array.isArray(res)
					? res.map((tmdb) => ({ db: {} as any, tmdb }))
					: [];
				setData(mapped);
			})
			.finally(() => setLoading(false));
	}, [props.type]);

	return (
		<>
			<Text className="font-rubik-semibold text-text text-xl mb-2">
				Popularne {props.type === "movie" ? "filmy" : "seriale"}
			</Text>
			<MovieGrid
				data={data}
				loading={loading}
				orientation={props.orientation ?? "vertical"}
				maxItems={12}
			/>
		</>
	);
}
