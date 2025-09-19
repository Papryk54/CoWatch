import {
	getMyProfile,
} from "@/lib/appwrite";
import { getMyFriends } from "@/lib/appwrite/appwriteFriends";
import { createSession } from "@/lib/appwrite/appwritePickerSession";
import { getMyWatchlists, getWatchlistItems } from "@/lib/appwrite/appwriteWatchlist";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

export default function SessionConfig() {
	const [friends, setFriends] = useState<any[]>([]);
	const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
	const [watchlists, setWatchlists] = useState<any[]>([]);
	const [selectedWatchlists, setSelectedWatchlists] = useState<string[]>([]);
	const [TitlesInWatchlists, setTitlesInWatchlists] = useState<number>(0);
	const [me, setMe] = useState<any>();
	const [showFriendsModal, setShowFriendsModal] = useState(false);

	const MIN_TITLES = 4;
	const STANDARD_TITLES = 12;

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

	const load = async () => {
		try {
			const friendsRes = await getMyFriends();
			setFriends(friendsRes?.documents ?? []);
			const watchlists = await getMyWatchlists();
			setWatchlists(watchlists?.documents ?? []);
			const me = await getMyProfile();
			setMe(me);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const handleToggleFriend = (id: string) => {
		setSelectedFriends((prev) =>
			prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
		);
	};

	const handleToggleWatchlist = async (id: string) => {
		setSelectedWatchlists((prev) => {
			let newSelected;
			if (prev.includes(id)) {
				newSelected = prev.filter((f) => f !== id);
			} else {
				newSelected = [...prev, id];
			}
			(async () => {
				try {
					let total = 0;
					for (let i = 0; i < newSelected.length; i++) {
						const watchlist = await getWatchlistItems(newSelected[i]);
						total += watchlist?.documents.length ?? 0;
					}
					setTitlesInWatchlists(total);
				} catch (e) {
					console.log("ERROR occurs in handleToggleWatchlist: ", e);
				}
			})();

			return newSelected;
		});
	};

	const goToSession = async (sessionId: string) => {
		router.push({
			pathname: "/(root)/(flow)/multiStepPicker/[sessionId]",
			params: { sessionId },
		});
	};

	const handleEndConfig = async () => {
		if (!me || selectedFriends.length === 0) return;
		const session = await createSession(me.$id, selectedFriends);
		goToSession(session!.$id);
	};

	return (
		<View className="flex-1 bg-brand-bgc">
			<View className="bg-brand-dark rounded-xl p-5 mb-8 shadow-lg">
				{/* Sekcja znajomych */}
				<View className="flex-row justify-between items-center mb-5">
					<Text className="text-text font-rubik-bold text-lg">Znajomi</Text>
					<Pressable
						onPress={() => setShowFriendsModal(true)}
						className="bg-brand px-3 py-1 rounded"
					>
						<Text className="text-white text-base font-rubik-medium">
							Dodaj
						</Text>
					</Pressable>
				</View>
				{showFriendsModal && (
					<View className="absolute inset-0 z-30 justify-center items-center">
						<Pressable
							className="absolute inset-0 bg-black/40"
							onPress={() => setShowFriendsModal(false)}
						/>
						<View className="bg-brand-dark p-6 rounded-2xl shadow-2xl w-11/12 max-w-lg mx-auto">
							<Text className="text-text font-rubik-bold mb-4 text-center text-lg">
								Wybierz znajomego
							</Text>
							<FlatList
								data={friends}
								keyExtractor={(item) => item.$id ?? item.name}
								renderItem={({ item }) => {
									return (
										<View className="flex-row justify-between items-center mb-3">
											<Text className="text-text text-base">{item.name}</Text>
											<Pressable
												className="bg-brand px-4 py-1 rounded"
												onPress={() => handleToggleFriend(item.$id)}
											>
												<Text className="text-white font-rubik-medium">
													{selectedFriends.includes(item.$id)
														? "Usuń"
														: "Dodaj"}
												</Text>
											</Pressable>
										</View>
									);
								}}
								style={{ maxHeight: 250 }}
							/>
							<Pressable
								className="mt-6 bg-alerts-error px-4 py-2 rounded"
								onPress={() => setShowFriendsModal(false)}
							>
								<Text className="text-white text-center font-rubik-medium">
									Zamknij
								</Text>
							</Pressable>
						</View>
					</View>
				)}
				{selectedFriends.length === 0 && (
					<Text className="text-gray-400 text-center">
						Nie wybrano jeszcze żadnych znajomych
					</Text>
				)}
				<FlatList
					data={friends.filter((item) => selectedFriends.includes(item.$id))}
					horizontal
					nestedScrollEnabled
					keyExtractor={(item) => item.$id ?? item.name}
					renderItem={({ item }) => {
						const isSelected = selectedFriends.includes(item.$id);
						return (
							<Pressable
								key={item.$id}
								onPress={() => handleToggleFriend(item.$id)}
								className={`rounded-full px-5 py-2 flex-row items-center justify-between mr-3 border ${isSelected ? "bg-brand border-brand" : "bg-brand-dark/60 border-brand-accent"}`}
								style={{ minWidth: 80 }}
							>
								<Text className="text-text font-rubik-medium">{item.name}</Text>
							</Pressable>
						);
					}}
					contentContainerStyle={{ flexDirection: "row", marginBottom: 18 }}
					showsHorizontalScrollIndicator={false}
				/>

				{/* Sekcja list */}
				<Text className="text-text font-rubik-bold mb-3 text-lg">Listy</Text>
				<FlatList
					data={watchlists}
					horizontal
					nestedScrollEnabled
					keyExtractor={(item) => item.$id ?? item.name}
					renderItem={({ item }) => {
						const isSelected = selectedWatchlists.includes(item.$id);
						return (
							<Pressable
								key={item.$id}
								onPress={() => handleToggleWatchlist(item.$id)}
								className={`rounded-xl px-5 py-3 flex-row items-center justify-between mr-3 border ${isSelected ? "bg-brand border-brand" : "bg-brand-dark/60 border-brand-accent"}`}
								style={{ minWidth: 120 }}
							>
								<View className="flex-row items-center">
									<View
										className={`w-6 h-6 rounded-full items-center justify-center mr-2 border ${isSelected ? "bg-brand border-brand" : "border-brand-accent bg-brand-dark"}`}
									/>
									<Text className="text-text font-rubik-medium">
										{item.name}
									</Text>
									<Text className="text-text font-rubik-light ml-2">
										({item.watchListItems.length})
									</Text>
								</View>
							</Pressable>
						);
					}}
					contentContainerStyle={{ flexDirection: "row", marginBottom: 10 }}
					showsHorizontalScrollIndicator={false}
				/>
			</View>

			{/* Sekcja z plakatami filmów z wybranych watchlist */}
			<View className="bg-brand-dark rounded-xl p-4 mb-8">
				<Text className="text-text font-rubik-bold mb-3 text-lg">
					Wybrane tytuły
				</Text>
				<FlatList
					data={watchlists
						.filter((wl) => selectedWatchlists.includes(wl.$id))
						.flatMap((wl) => wl.watchListItems || [])}
					horizontal
					keyExtractor={(item) => item.$id ?? item.title}
					renderItem={({ item }) => {
						return (
							<View className="mr-3 items-center">
								{item.poster ? (
									<Image
										source={{ uri: item.poster }}
										className="w-24 h-36 rounded-lg object-cover"
									/>
								) : (
									<View className="w-24 h-36 rounded-lg bg-gray-700 items-center justify-center">
										<Text className="text-xs text-gray-300 text-center px-2">
											{item.title}
										</Text>
									</View>
								)}
								<Text
									className="text-xs text-text mt-1 text-center max-w-[96px]"
									numberOfLines={2}
								>
									{item.title}
								</Text>
							</View>
						);
					}}
					contentContainerStyle={{ flexDirection: "row" }}
					showsHorizontalScrollIndicator={false}
					ListEmptyComponent={
						<Text className="text-gray-400 text-center">
							Brak wybranych tytułów
						</Text>
					}
				/>
			</View>
			<View className="absolute bottom-0 left-0 w-full px-4 py-4 bg-brand-dark items-center">
				<View className="mb-2 w-full max-w-md">
					<Text className="text-xs text-gray-400 text-center mb-1">
						Wybrane listy zawierają: {TitlesInWatchlists} tytułów.
					</Text>
					<Text className="text-xs text-gray-400 text-center">
						{TitlesInWatchlists < MIN_TITLES &&
							`Potrzeba przynajmniej ${MIN_TITLES} tytułów, aby rozpocząć`}
						{TitlesInWatchlists >= MIN_TITLES &&
							TitlesInWatchlists < STANDARD_TITLES &&
							`Jednak warto dodać ich przynajmniej ${STANDARD_TITLES}`}
					</Text>
				</View>
				<Pressable
					className={`w-11/12 max-w-md py-3 rounded-lg font-semibold items-center transition ${TitlesInWatchlists >= STANDARD_TITLES ? "bg-brand" : TitlesInWatchlists >= MIN_TITLES ? "bg-alerts-warning" : "bg-alerts-error"}`}
					disabled={TitlesInWatchlists < MIN_TITLES}
					onPress={handleEndConfig}
				>
					<Text className="text-white font-semibold">Zaczynamy!</Text>
				</Pressable>
			</View>
		</View>
	);
}
