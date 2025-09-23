import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { MovieGrid } from "../../../components/layout/movieGrid";

export default function MovieSearch() {
	const { query: initialQuery, selectedType: initialType } =
		useLocalSearchParams();
	const [query, setQuery] = useState(initialQuery || "");
	const [items, setItems] = useState<WatchlistItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [thereIsMore, setThereIsMore] = useState(false);
	const [debouncedQuery, setDebouncedQuery] = useState(query);
	const [selectedType, setSelectedType] = useState<"movie" | "tv">(
		(initialType as "movie" | "tv") || "movie"
	);

	async function handleSearch() {
		setLoading(true);
		setError(null);
		try {
			const results = await getMergedDBandTMDBItems({
				type: selectedType,
				search: Array.isArray(query) ? query[0] : query!,
				action: "search",
				page,
			});
			const resultsAhead = await getMergedDBandTMDBItems({
				type: selectedType,
				search: Array.isArray(query) ? query[0] : query!,
				action: "search",
				page: page + 1,
			});
			const filteredResults = (results ?? []).filter(
				(item) => item.tmdb.vote_count > 10 && item.tmdb.poster_path
			);
			const filteredResultsAhead = (resultsAhead ?? []).filter(
				(item) => item.tmdb.vote_count > 10 && item.tmdb.poster_path
			);
			if (filteredResultsAhead && filteredResultsAhead.length > 0) {
				console.log("There are more results ahead");
				console.log("resultsAhead: ", filteredResultsAhead.length);
				setThereIsMore(true);
				setPage((prev) => prev + 1);
			} else {
				setThereIsMore(false);
			}
			if (query && filteredResults.length === 0) {
				setError("Brak wyników.");
			}
			setItems(filteredResults);
		} catch (e) {
			console.log("ERROR occurs in handleSearch: ", e);
			setError("Wystąpił błąd podczas pobierania filmów/seriali.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(query);
		}, 700);

		return () => {
			clearTimeout(handler);
		};
	}, [query]);

	useEffect(() => {
		setPage(1);
		setItems([]);
		handleSearch();
	}, [debouncedQuery, selectedType]);

	return (
		<View className="p-4 w-screen h-full bg-brand-bgc">
			<FlatList
				data={[]}
				renderItem={null}
				ListHeaderComponent={
					<View className="rounded-xl">
						<View className="flex-row justify-center w-full mb-4">
							<TextInput
								value={Array.isArray(query) ? query[0] : query}
								onChangeText={setQuery}
								autoFocus
								placeholder={`Wpisz tytuł ${
									selectedType === "movie" ? "filmu" : "serialu"
								}...`}
								className="text-text flex-1 border-b border-gray-300/50 rounded-lg"
								placeholderTextColor="#888"
							/>
						</View>
						<View className="flex-row mb-4">
							<Pressable
								onPress={() => setSelectedType("movie")}
								className={`px-4 py-2 rounded-xl mr-2 ${
									selectedType === "movie" ? "bg-brand" : "bg-gray-700"
								}`}
							>
								<Text className="text-white">Filmy</Text>
							</Pressable>
							<Pressable
								onPress={() => setSelectedType("tv")}
								className={`px-4 py-2 rounded-xl ${
									selectedType === "tv" ? "bg-brand" : "bg-gray-700"
								}`}
							>
								<Text className="text-white">Seriale</Text>
							</Pressable>
						</View>

						{error && (
							<Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
						)}
						{items.length > 0 && <MovieGrid data={items} loading={loading} />}
						{!loading && thereIsMore && (
							<Pressable
								onPress={handleSearch}
								className="bg-brand px-4 py-3 rounded-xl items-center"
							>
								<Text className="text-white">Więcej</Text>
							</Pressable>
						)}
					</View>
				}
			/>
		</View>
	);
}
