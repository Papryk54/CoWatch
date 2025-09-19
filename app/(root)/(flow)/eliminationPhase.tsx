import LoadingScreen from "@/components/loadingScreen";
import { WinnerModal } from "@/components/winnerModal";
import {
	client,
	config,
	getMyProfile,
} from "@/lib/appwrite";
import { attackItem, getCurrentUserForElimination } from "@/lib/appwrite/appwriteElimination";
import { deleteSession, getSessionItems } from "@/lib/appwrite/appwritePickerSession";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

type Props = {
	sessionId: string;
	onDone: () => void;
};

type MovieItem = {
	id: string;
	tmdb_id: number;
	score: number;
	heartPoints: 0 | 1 | 2 | 3;
	poster_path: string | null;
	title: string;
	overview: string;
	genres?: any[];
	vote_average?: number;
};

type SelectedMovie = MovieItem;

const EliminationPhase = ({ sessionId, onDone }: Props) => {
	const [itemsForElimination, setItemsForElimination] = useState<MovieItem[]>(
		[]
	);
	const [selected, setSelected] = useState<SelectedMovie | null>(null);
	const [loading, setLoading] = useState(true);
	const [showWinnerModal, setShowWinnerModal] = useState(false);
	const [currentUser, setCurrentUser] = useState<any | null>(null);
	const [isMyTurn, setIsMyTurn] = useState(false);

	const TMDB = {
		base: "https://api.themoviedb.org/3",
		img: (
			path?: string | null,
			size: "w300" | "w500" | "w780" | "original" = "w500"
		) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined),
		headers: {
			Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_CODE}`,
			"Content-Type": "application/json;charset=utf-8",
		} as HeadersInit,
	};

	const fetchTmdbMovie = async (id: number) => {
		try {
			const res = await fetch(`${TMDB.base}/movie/${id}?language=pl-PL`, {
				headers: TMDB.headers,
			});
			if (!res.ok) throw new Error(`TMDB ${id} ${res.status}`);
			return await res.json();
		} catch (e) {
			console.log("ERROR occurs in fetchTmdbMovie: ", e);
			return {
				id,
				title: "Brak danych",
				overview: "",
				poster_path: null,
			};
		}
	};

	const load = async () => {
		try {
			setLoading(true);
			const currentUserName = await getCurrentUserForElimination(sessionId);
			setCurrentUser(currentUserName);
			const me = await getMyProfile();
			setIsMyTurn(currentUserName === me.name);
			const items = await getSessionItems(sessionId);
			const merged: MovieItem[] = await Promise.all(
				items.map(async (item: any) => {
					const tmdb = await fetchTmdbMovie(item.tmdb_id);
					return {
						id: item.$id,
						tmdb_id: item.tmdb_id,
						score: item.score,
						heartPoints: item.hearts,
						poster_path: tmdb.poster_path ?? null,
						title: tmdb.title ?? "Brak danych",
						overview: tmdb.overview ?? "",
						genres: tmdb.genres,
						vote_average: tmdb.vote_average,
					};
				})
			);
			merged.sort((a, b) => b.score - a.score);
			setItemsForElimination(merged);
			const firstWithHearts = merged.find((i) => i.heartPoints > 0);
			setSelected(firstWithHearts ?? null);
		} catch (e: any) {
			console.log("ERROR occurs in load: ", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const handleSelect = async (item: MovieItem) => {
		if (item.heartPoints <= 0) return;
		setSelected(item);
	};

	useEffect(() => {
		if (!itemsForElimination || itemsForElimination.length === 0) {
			setSelected(null);
			return;
		}
		const itemsLeft = itemsForElimination.filter((i) => i.heartPoints > 0);
		if (itemsLeft.length === 1) {
			handleEndGame(itemsLeft[0]);
			return;
		}
		if (selected) {
			const stillExists = itemsLeft.find(
				(i) => i.id === selected.id && i.heartPoints > 0
			);
			if (stillExists) {
				setSelected(stillExists);
				return;
			}
		}
		const firstWithHearts = itemsForElimination.find((i) => i.heartPoints > 0);
		setSelected(firstWithHearts ?? null);
	}, [itemsForElimination]);

	useEffect(() => {
		const channel = `databases.${config.databaseId}.collections.${config.databaseMultiStepPickerItems}.documents`;

		const unsubscribe = client.subscribe(channel, async (response) => {
			const eventType = response.events[0];
			const changedItem = response.payload as any;
			if (eventType.includes("update")) {
				setItemsForElimination((prev) => {
					const updatedItems = prev.map((item) =>
						item.id === changedItem.$id
							? { ...item, heartPoints: changedItem.hearts }
							: item
					);
					return updatedItems;
				});
			}
		});

		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		const channel = `databases.${config.databaseId}.collections.${config.databaseMultiStepPicker}.documents`;

		const unsubscribe = client.subscribe(channel, async (response) => {
			const eventType = response.events[0];
			if (eventType.includes("update")) {
				const currentUserId = await getCurrentUserForElimination(sessionId);
				setCurrentUser(currentUserId);
				const me = await getMyProfile();
				setIsMyTurn(currentUserId === me.name);
			}
		});
		return () => {
			unsubscribe();
		};
	}, []);

	const handleDealDamage = (id: string) => async () => {
		if (!id) return;
		setIsMyTurn(false);
		await attackItem(id, sessionId);
	};

	const handleEndGame = async (winner: MovieItem) => {
		setSelected(winner);
		setShowWinnerModal(true);
		await deleteSession(sessionId);
		return;
	};

	return (
		<View className="w-full h-[100%] justify-between p-0">
			{loading && <LoadingScreen />}
			{showWinnerModal && selected && (
				<WinnerModal
					tmdb_id={selected.tmdb_id}
					isOpen={showWinnerModal}
					onClose={() => onDone()}
				/>
			)}
			{!selected ||
				(selected.heartPoints <= 0 && (
					<View className="flex-1 justify-center items-center">
						<Text className="text-text font-rubik-extrabold text-lg text-center px-4">
							Brak dostępnych filmów do ataku. Poczekaj na swoją kolej.
						</Text>
					</View>
				))}
			<View className="w-full h-[60%] flex-col items-center justify-between align-middle">
				<View className="flex-row w-full rounded-full h-[60%] justify-center items-center">
					<Image
						source={{
							uri:
								TMDB.img(selected?.poster_path, "w780") ??
								"https://picsum.photos/600/900",
						}}
						className="h-[90%] aspect-[2/3]"
					/>

					<View className="flex-row flex-wrap justify-start mb-1 w-[50%]">
						<View className="flex-col flex-wrap justify-start ml-4 w-full">
							<Text className="text-md text-white font-rubik-semibold mb-1">
								Tagi:
							</Text>
							<View className="flex-row flex-wrap mb-1">
								{selected?.genres?.[0] && (
									<Text className="text-sm text-white bg-brand-accent/80 rounded px-2 py-1 mr-2 mb-1">
										{selected.genres?.[0].name}
									</Text>
								)}
								{selected?.genres?.[1] && (
									<Text className="text-sm text-white bg-brand-accent/80 rounded px-2 py-1 mr-2 mb-1">
										{selected.genres?.[1].name}
									</Text>
								)}
								{selected?.genres?.[2] && (
									<Text className="text-sm text-white bg-brand-accent/80 rounded px-2 py-1 mr-2 mb-1">
										{selected.genres?.[2].name}
									</Text>
								)}
							</View>
						</View>
						<View className="flex-col flex-wrap justify-start ml-4 mb-1 w-full">
							<Text className="text-md text-white font-rubik-semibold mb-1">
								Rok:
							</Text>
							<Text className="text-sm text-white bg-brand-accent/80 rounded px-2 py-1">
								{new Date().getFullYear()}
							</Text>
						</View>
						<View className="flex-col flex-wrap justify-start ml-4 mb-1 w-full">
							<Text className="text-md text-white font-rubik-semibold">
								Ocena Imdb:
							</Text>
							<View className="flex-row items-center rounded-lg">
								<Text className="text-brand-accent rounded-lg text-xl">
									{selected?.vote_average?.toFixed(1) ?? "N/A"}
								</Text>
								<Image
									className="h-9 w-9"
									source={require("../../../assets/icons/rating.png")}
								/>
							</View>
						</View>
					</View>
				</View>
				<View className="w-full h-[50%]">
					<Text className="text-text font-rubik-extrabold text-xl text-center mb-1 h-[20%]">
						{selected?.title ?? "Tytuł"}
					</Text>
					<Text
						className="text-text font-rubik text-center mb-4 h-[80%]"
						numberOfLines={8}
						ellipsizeMode="tail"
					>
						{selected?.overview && selected.overview.length > 0
							? selected.overview
							: `\n` + "Ten film nie ma opisu."}
					</Text>
				</View>
			</View>
			<View className="w-full justify-center items-center h-[35%]">
				<FlatList
					data={itemsForElimination}
					horizontal
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item) => item.tmdb_id.toString()}
					renderItem={({ item }) => {
						return (
							<Pressable
								onPress={() => handleSelect(item)}
								disabled={item.heartPoints <= 0}
								className={`items-center mx-2 ${selected?.tmdb_id === item.tmdb_id ? "opacity-100" : "opacity-70"}`}
							>
								<View className={` rounded-lg h-36 w-24`}>
									<Image
										source={{
											uri:
												TMDB.img(item.poster_path, "w300") ??
												"https://picsum.photos/200/300",
										}}
										className={`${item.heartPoints <= 0 ? "bg-gray-400 opacity-20" : ""} rounded-lg h-36 w-24 ${selected?.tmdb_id === item.tmdb_id ? "border-2 border-white" : ""} ${item.heartPoints <= 0 ? "border-2 border-alerts-error" : ""}`}
									/>
									<View className="absolute left-0 right-0 bottom-0 align-middle items-center justify-center">
										<Text
											className="text-lg text-text font-rubik-semibold"
											style={{
												textShadowColor: "#fff",
												textShadowRadius: 6,
											}}
										>
											{"❤️".repeat(item.heartPoints)}
										</Text>
									</View>
								</View>
								<Text
									className="text-text font-rubik-medium mt-1 text-xs"
									numberOfLines={1}
									style={{ maxWidth: 80 }}
								>
									{item?.title ?? "Tytuł"}
								</Text>
							</Pressable>
						);
					}}
					contentContainerStyle={{
						paddingHorizontal: 12,
						alignItems: "center",
						backgroundColor: "#18181b",
					}}
				/>
				<Pressable
					className={`${isMyTurn ? "bg-brand-accent" : "bg-gray-600"} rounded-2xl items-center h-16 justify-center p-4 flex-row w-full`}
					onPress={selected ? handleDealDamage(selected.id) : undefined}
					disabled={!isMyTurn}
				>
					<Image
						source={require("../../../assets/icons/sword.png")}
						className="h-16 w-16 rounded-full mr-2"
					/>
					{isMyTurn && (
						<Text className="text-white font-rubik-extrabold text-lg">
							Twoja kolej {currentUser}
						</Text>
					)}
					{!isMyTurn && (
						<Text className="text-alerts-error font-rubik-extrabold text-lg">
							{currentUser} wybiera swój cel
						</Text>
					)}
					<Image
						source={require("../../../assets/icons/sword.png")}
						className="h-16 w-16 rounded-full mr-2 rotate-180"
						style={{ transform: [{ scaleX: -1 }] }}
					/>
				</Pressable>
			</View>
		</View>
	);
};

export default EliminationPhase;
