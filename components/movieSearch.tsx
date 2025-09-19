import { config } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Button,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { MovieGrid } from "./movieGrid";
import { Movie } from "./movieTile";

const TMDB_API_KEY = config.tmdbApiKey;
const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

export function MovieSearch() {
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	async function fetchMovies(search: string) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`${TMDB_SEARCH_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(search)}&language=pl-PL&page=${page}`
			);
			const data = await res.json();
			if (data.results) {
				setMovies(
					data.results.map((m: any) => ({
						id: m.id,
						title: m.title,
						poster_path: m.poster_path,
						overview: m.overview,
						release_date: m.release_date,
						vote_average: m.vote_average,
					}))
				);
				setPage((prev) => prev + 1);
			} else {
				setMovies([]);
			}
		} catch (e) {
			console.log("ERROR occurs in fetchMovies: ", e);
			setError("Wystąpił błąd podczas pobierania filmów.");
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		if (query.trim().length === 0) {
			return;
		}
		fetchMovies(query);
	}

	useEffect(() => {
		setPage(1);
		if (query.trim().length === 0) {
			setMovies([]);
			return;
		}
	}, [query]);

	return (
		<View className="bg-brand-dark rounded-xl p-4 -m-4">
			<View className="flex-row mb-8">
				<TextInput
					value={query}
					onChangeText={setQuery}
					placeholder="Wpisz tytuł filmu..."
					className="text-text flex-1 border border-gray-300 rounded-lg p-2 mr-2"
					placeholderTextColor="#888"
				/>
				<Button title="Szukaj" onPress={handleSearch} />
			</View>
			{loading && <ActivityIndicator size="large" color="#888" />}
			{error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
			<MovieGrid data={movies} loading={loading} />
			{!loading && movies.length > 19 && (
				<Pressable
					onPress={handleSearch}
					className="bg-brand px-4 py-3 rounded-xl items-center"
				>
					<Text className="text-white">Więcej</Text>
				</Pressable>
			)}
		</View>
	);
}
