import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Button,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { MovieGrid } from "../layout/movieGrid";

export function MovieSearch() {
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState<WatchlistItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [selectedType, setSelectedType] = useState<"movie" | "tv">("movie");

	async function handleSearch() {
		setLoading(true);
		setError(null);
		try {
			const results = await getMergedDBandTMDBItems({
				type: selectedType,
				search: query,
				action: "search",
				page,
			});
			setMovies(Array.isArray(results) ? results : results.results || []);
		} catch (e) {
			console.log("ERROR occurs in handleSearch: ", e);
			setError("Wystąpił błąd podczas pobierania filmów/seriali.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		setPage(1);
		setMovies([]);
	}, [query, selectedType]);

	return (
		<View className="bg-brand-dark rounded-xl p-4 -m-4">
			<View className="flex-row mb-4">
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
			<View className="flex-row mb-8">
				<TextInput
					value={query}
					onChangeText={setQuery}
					placeholder={`Wpisz tytuł ${selectedType === "movie" ? "filmu" : "serialu"}...`}
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
