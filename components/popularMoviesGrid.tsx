import { MovieGrid } from "@/components/movieGrid";
import { fetchPopularMovies } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { Movie } from "./movieTile";

export function PopularMoviesGrid(props: {
	orientation?: "vertical" | "horizontal";
}) {
	const [data, setData] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchPopularMovies()
			.then((res) => setData(res.results))
			.finally(() => setLoading(false));
	}, []);

	return (
		<>
			<Text className="font-rubik-semibold text-text text-xl mt-6 mb-2">
				Popularne filmy:
			</Text>
			<MovieGrid
				data={data}
				loading={loading}
				orientation={props.orientation ?? "vertical"}
			/>
		</>
	);
}
