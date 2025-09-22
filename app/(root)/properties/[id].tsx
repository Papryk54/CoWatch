import MovieActionButtons from "@/components/utils/movieActionButtons";
import {
	WatchlistItem,
	fetchTMDBItems,
	getMergedDBandTMDBItems,
	getTMDBCredits,
} from "@/lib/tmdb";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	ImageBackground,
	Pressable,
	Text,
	View,
} from "react-native";

const FALLBACK_POSTER = require("@/assets/images/posters/moviePoster7.png");
const RATING_ICON = require("@/assets/icons/rating.png");

export default function ItemDetailsScreen() {
	const { id, type } = useLocalSearchParams<{
		id: string;
		type: "movie" | "tv";
	}>();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState<string | null>(null);
	const [item, setItem] = useState<any | null>(null);
	const [credits, setCredits] = useState<any | null>(null);
	const [similar, setSimilar] = useState<WatchlistItem[]>([]);

	useEffect(() => {
		let mounted = true;
		async function run() {
			try {
				setLoading(true);
				setErr(null);

				const [itemData, creditsData] = await Promise.all([
					fetchTMDBItems({ type, action: "find", itemId: Number(id) }),
					getTMDBCredits(Number(id), type),
					getMergedDBandTMDBItems({
						type,
						action: "search",
						search: "",
						page: 1,
					}),
				]);
				console.log("Fetched item data: ", itemData);
				console.log("Fetched credits data: ", creditsData);

				if (!mounted) return;

				if (!itemData) throw new Error("Nie udało się pobrać danych filmu.");
				setItem(itemData);

				setCredits(creditsData?.cast ? creditsData : { cast: [] });

				const sItems = await fetchTMDBItems({
					type,
					action: "similar",
					itemId: Number(id),
					page: 1,
				});
				const similarResults =
					sItems?.results && Array.isArray(sItems.results)
						? sItems.results
						: [];
				const similarItems = similarResults.map((tmdb: any) => {
					return { db: {} as any, tmdb };
				});
				similarItems.sort((a: any, b: any) => {
					return (b.tmdb.vote_average || 0) - (a.tmdb.vote_count || 0);
				});
				setSimilar(similarItems.slice(0, 8));
			} catch (e: any) {
				console.log("ERROR occurs in MovieDetailsScreen: ", e);
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

	const year = item?.release_date?.split("-")[0] || undefined;
	const ratingText =
		item?.vote_average != null && Number.isFinite(item.vote_average)
			? (Math.round(item.vote_average * 10) / 10).toFixed(0)
			: "-";
	const metaLine = [
		year,
		item?.runtime && `${item.runtime} min`,
		item?.genres
			?.slice(0, 3)
			.map((g: any) => g.name)
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

	if (err || !item) {
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
							<View className="w-screen -my-6 absolute">
								<View className="absolute inset-0 bg-brand-bgc" />
								<Image
									source={
										item.poster_path
											? {
													uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
												}
											: FALLBACK_POSTER
									}
									defaultSource={FALLBACK_POSTER}
									onError={() => {
										setItem({ ...item, poster_path: null });
									}}
									resizeMode="cover"
									className="w-full aspect-[2/3] mt-28"
								/>
								<Image
									source={require("@/assets/gradient.png")}
									resizeMode="cover"
									className="mt-28 absolute"
								/>
								<LinearGradient
									colors={[
										"rgba(10,15,28,1)",
										"rgba(10,15,28,0.2)",
										"rgba(10,15,28,1)",
									]}
									className="absolute inset-0"
								/>
							</View>

							<View className="w-screen px-4 mt-12">
								<Text className="text-text text-3xl font-bold text-center">
									{item.title || item.name}
								</Text>

								<View className="items-center mt-1">
									<Text className="text-text/70 text-sm text-center">
										{metaLine}
									</Text>
								</View>
							</View>
							<View className="px-2 mt-12">
								<View className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
									<Text className="text-text text-base leading-6 text-center">
										{item.overview || "Brak opisu."}
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
																? {
																		uri: `https://image.tmdb.org/t/p/w500${item.profile_path}`,
																	}
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
									<View className="h-60 mb-12">
										<FlatList
											data={similar}
											horizontal
											keyExtractor={(item) => item.tmdb.id.toString()}
											showsHorizontalScrollIndicator={false}
											renderItem={({ item }) => (
												<View className="w-44 h-full mr-4 relative rounded-md bg-slate-200">
													<Link href={`/(root)/properties/${item.tmdb.id}`}>
														<ImageBackground
															source={
																item.tmdb.poster_path
																	? {
																			uri: `https://image.tmdb.org/t/p/w500${item.tmdb.poster_path}`,
																		}
																	: FALLBACK_POSTER
															}
															className="w-full h-full"
															resizeMode="cover"
														>
															<View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-black/60 absolute top-2 right-2">
																<Text className="font-rubik-semibold text-text text-xs leading-none ">
																	{item.tmdb.vote_average}
																</Text>
																<Image
																	source={require("@/assets/icons/rating.png")}
																	className="w-5 h-5"
																	resizeMode="contain"
																/>
															</View>
															<LinearGradient
																colors={["transparent", "rgba(0,0,0,0.8)"]}
																className="absolute inset-0"
															/>
														</ImageBackground>
													</Link>

													<Text
														className="text-text font-rubik-semibold text-md ml-1 w-full absolute bottom-0 "
														numberOfLines={2}
													>
														{item.tmdb.title || item.tmdb.name}
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
				<MovieActionButtons movieId={item.id}></MovieActionButtons>
			</View>
		</>
	);
}
