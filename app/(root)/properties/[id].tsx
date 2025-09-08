import MovieActionButtons from "@/components/movieActionButtons";
import { Movie } from "@/components/movieTile";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	Text,
	View,
} from "react-native";

type TMDBMovie = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	vote_average: number;
	release_date?: string;
	runtime?: number;
	genres?: { id: number; name: string }[];
};

type TMDBCredits = {
	cast: {
		id: number;
		name: string;
		character: string;
		profile_path: string | null;
	}[];
};

const FALLBACK_POSTER = require("@/assets/images/posters/moviePoster7.png");
const RATING_ICON = require("@/assets/icons/rating.png");

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

export default function MovieDetailsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState<string | null>(null);
	const [movie, setMovie] = useState<TMDBMovie | null>(null);
	const [credits, setCredits] = useState<TMDBCredits | null>(null);
	const [similar, setSimilar] = useState<Movie[]>([]);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		let mounted = true;
		async function run() {
			try {
				setLoading(true);
				setErr(null);
				const [dRes, cRes, sRes] = await Promise.all([
					fetch(
						`${TMDB.base}/movie/${id}?language=pl-PL&append_to_response=release_dates`,
						{ headers: TMDB.headers }
					),
					fetch(`${TMDB.base}/movie/${id}/credits?language=pl-PL`, {
						headers: TMDB.headers,
					}),
					fetch(`${TMDB.base}/movie/${id}/similar?language=pl-PL&page=1`, {
						headers: TMDB.headers,
					}),
				]);

				if (!dRes.ok) throw new Error("Nie udało się pobrać danych filmu.");
				const dJson = (await dRes.json()) as TMDBMovie;

				const cJson = cRes.ok
					? ((await cRes.json()) as TMDBCredits)
					: { cast: [] };
				const sJson = sRes.ok ? await sRes.json() : { results: [] };

				if (!mounted) return;

				setMovie(dJson);
				setCredits(cJson);

				const mappedSimilar: Movie[] = (sJson.results ?? []).map((m: any) => ({
					id: m.id,
					title: m.title,
					vote_average: m.vote_average ?? 0,
					poster_path: m.poster_path ?? null,
				}));
				setSimilar(mappedSimilar);
			} catch (e: any) {
				setErr(e?.message ?? "Wystąpił błąd.");
			} finally {
				setLoading(false);
			}
		}
		run();
		return () => {
			mounted = false;
		};
	}, [id]);

	const year = movie?.release_date?.split("-")[0] || undefined;
	const ratingText =
		movie?.vote_average != null && Number.isFinite(movie.vote_average)
			? (Math.round(movie.vote_average * 10) / 10).toFixed(0)
			: "-";
	const metaLine = [
		year,
		movie?.runtime && `${movie.runtime} min`,
		movie?.genres
			?.slice(0, 3)
			.map((g) => g.name)
			.join(", "),
	]
		.filter(Boolean)
		.join(" • ");

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: "Wczytywanie..." }} />
				<View className="flex-1 bg-brand-bgc items-center justify-center">
					<ActivityIndicator />
					<Text className="text-text mt-3">Pobieram dane filmu...</Text>
				</View>
			</>
		);
	}

	if (err || !movie) {
		return (
			<>
				<Stack.Screen options={{ title: "Błąd" }} />
				<View className="flex-1 bg-brand-bgc items-center justify-center px-6">
					<Text className="text-text text-center">
						{err ?? "Brak danych filmu."}
					</Text>
					<Pressable
						className="mt-4 px-4 py-2 rounded-2xl bg-brand"
						onPress={() => router.back()}
					>
						<Text className="text-text">Wróć</Text>
					</Pressable>
				</View>
			</>
		);
	}

	return (
		<>
			<View className="flex-1 bg-brand-bgc">
				<FlatList
					data={[]}
					keyExtractor={() => "x"}
					renderItem={null}
					ListHeaderComponent={() => (
						<View>
							<View className="w-screen -my-6">
								<Image
									source={
										movie.poster_path
											? { uri: TMDB.img(movie.poster_path)! }
											: FALLBACK_POSTER
									}
									defaultSource={FALLBACK_POSTER}
									onError={() => {
										setMovie({ ...movie, poster_path: null });
									}}
									resizeMode="cover"
									className="w-full aspect-[2/3] opacity-60"
								/>
								<LinearGradient
									colors={[
										"rgba(10,15,28,1)",
										"rgba(10,15,28,0.9)",
										"rgba(10,15,28,0.1)",
										"rgba(10,15,28,0.9)",
										"rgba(10,15,28,1)",
									]}
									className="absolute bottom-0 left-0 right-0 h-full"
								/>
							</View>

							<View className="absolute flex top-12 -left-4 w-screen px-4">
								<Text className="text-text text-3xl font-bold text-center mt-6">
									{movie.title}
								</Text>

								<View className="items-center mt-1">
									<Text className="text-text/70 text-sm text-center">
										{metaLine}
									</Text>
								</View>
							</View>
							<View className="px-2">
								<View className="-mt-48 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
									<Text className="text-text text-base leading-6 text-center">
										{movie.overview || "Brak opisu."}
									</Text>
								</View>


								<View className="items-center mt-4 mb-6">
									<View className="flex-row items-center rounded-full bg-white/10 border border-white/10 px-3 py-1.5">
										<Text className="text-text text-base font-rubik-bold">
											IMDB:
										</Text>
										<Image source={RATING_ICON} className="w-5 h-5 ml-1" />
										<Text className="text-text text-base font-rubik-bold">
											{ratingText}
										</Text>
									</View>
								</View>

								<View>
									<Text className="text-text text-xl font-rubik-semibold mb-2">
										Obsada:
									</Text>
									<View className="h-60 mb-6">
										<FlatList
											data={credits?.cast}
											horizontal
											keyExtractor={(item) => item.id.toString()}
											showsHorizontalScrollIndicator={false}
											renderItem={({ item }) => (
												<View className="w-44 h-full mr-4 relative rounded-md bg-slate-200">
													<Image
														source={
															item.profile_path
																? { uri: TMDB.img(item.profile_path)! }
																: FALLBACK_POSTER
														}
														defaultSource={FALLBACK_POSTER}
														resizeMode="cover"
														className="w-full h-full"
													/>
													<LinearGradient
														colors={["transparent", "rgba(0,0,0,0.8)"]}
														className="absolute inset-0"
													/>
													<Text
														className="text-text font-rubik-semibold text-md ml-1 w-full absolute bottom-0 "
														numberOfLines={2}
													>
														{item.name}
													</Text>
												</View>
											)}
										/>
									</View>
								</View>
								<View>
									<Text className="text-text text-xl font-rubik-semibold mb-2">
										Filmy z podobnymi tagami:
									</Text>
									<View className="h-60 mb-6">
										<FlatList
											data={similar}
											horizontal
											keyExtractor={(item) => item.id.toString()}
											showsHorizontalScrollIndicator={false}
											renderItem={({ item }) => (
												<View className="w-44 h-full mr-4 relative rounded-md bg-slate-200">
													<Image
														source={
															item.poster_path
																? { uri: TMDB.img(item.poster_path)! }
																: FALLBACK_POSTER
														}
														defaultSource={FALLBACK_POSTER}
														resizeMode="cover"
														className="w-full h-full"
													/>
													<LinearGradient
														colors={["transparent", "rgba(0,0,0,0.8)"]}
														className="absolute inset-0"
													/>
													<Text
														className="text-text font-rubik-semibold text-md ml-1 w-full absolute bottom-0 "
														numberOfLines={2}
													>
														{item.title}
													</Text>
												</View>
											)}
										/>
									</View>
								</View>
							</View>
						</View>
					)}
				/>
				<MovieActionButtons movieId={movie.id}></MovieActionButtons>
			</View>
		</>
	);
}
