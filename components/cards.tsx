import { fetchPopularMovies } from "@/lib/tmdb";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	ImageBackground,
	Text,
	View,
} from "react-native";

type Movie = {
	id: number;
	title: string;
	vote_average: number;
	poster_path: string | null;
};

export const Card = () => {
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchPopularMovies()
			.then((data) => setMovies(data.results))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<View className="h-60 justify-center items-center">
				<ActivityIndicator size="small" />
			</View>
		);
	}

	return (
		<FlatList
			data={movies}
			numColumns={3}
			keyExtractor={(item) => item.id.toString()}
			contentContainerClassName="mt-2"
			scrollEnabled={false}
			showsHorizontalScrollIndicator={false}
			columnWrapperStyle={{ gap: 8, justifyContent: "space-between" }}
			ItemSeparatorComponent={() => <View className="h-4" />}
			renderItem={({ item }) => (
				<View className="flex-1 h-60 rounded-2xl overflow-hidden bg-brand-dark">
					<ImageBackground
						source={
							item.poster_path
								? { uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }
								: undefined
						}
						className="w-full h-full"
						resizeMode="cover"
					>
						<View className="absolute inset-0 bg-black/20" />
						<View className="absolute bottom-0 left-0 right-0 h-20 bg-brand-bgc/80" />
						<View className="absolute top-2 right-2 bg-brand-dark/80 px-2 py-1 rounded-md">
							<Text className="font-rubik-semibold text-text text-xs">
								{Math.round(item.vote_average)}/10
							</Text>
						</View>
						<View className="absolute bottom-2 left-2 right-2">
							<Text
								numberOfLines={2}
								className="font-rubik-medium text-text text-sm"
							>
								{item.title}
							</Text>
						</View>
					</ImageBackground>
				</View>
			)}
			ListEmptyComponent={
				<Text className="text-text">Brak filmów do wyświetlenia</Text>
			}
			initialNumToRender={6}
		/>
	);
};
