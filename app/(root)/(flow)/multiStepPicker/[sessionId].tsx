import {
	addItemsToSession,
	getMyFriends,
	getMyProfile,
	getWatchlistItems,
} from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import GroupPhase from "../groupPhase";
import TinderPhase from "../tinderPhase";

const MultiStepPicker = () => {
	const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

	const [friends, setFriends] = useState<any>([]);
	const [friendsForGame, setFriendsForGame] = useState<any[]>([]);
	const [currentStep, setCurrentStep] = useState(0);

	const onDone = () => {
		setCurrentStep((prev) => prev + 1);
	};

	const getMovieIds = async (friendsForGame: any[]) => {
		if (!sessionId) {
			console.warn("Brak sessionId w parametrach trasy.");
			return;
		}
		try {
			const watchlistIds = friendsForGame
				.flatMap((f: any) => (Array.isArray(f.watchList) ? f.watchList : []))
				.map((w: any) => w?.$id)
				.filter(Boolean);

			const me = await getMyProfile();
			const myWatchlistIds = (me?.watchList ?? [])
				.map((w: any) => w?.$id)
				.filter(Boolean) as string[];

			const allWatchlistIds = Array.from(
				new Set([...watchlistIds, ...myWatchlistIds])
			);
			const lists = await Promise.all(
				allWatchlistIds.map((id: string) => getWatchlistItems(id))
			);
			const items = lists.flatMap((res: any) => res?.documents ?? []);
			const ids = items
				.map((it: any) => Number(it?.tmdb_id))
				.filter((v) => !isNaN(v));
			const uniqueIds = Array.from(new Set(ids));

			return addItemsToSession(sessionId, uniqueIds);
		} catch (e) {
			console.log(e);
		}
	};

	const handleStart = () => {
		setCurrentStep(1);
	};

	const load = async () => {
		try {
			const friendsRes = await getMyFriends();
			setFriends(friendsRes?.documents);
		} catch (e) {
			console.log(e);
		}
	};

	const handleAddFriendToGame = (friend: any) =>
		setFriendsForGame((prev) =>
			prev.includes(friend) ? prev : [...prev, friend]
		);

	useEffect(() => {
		load();
	}, []);

	const handleSkip = () => {
		setCurrentStep(2);
	};

	return (
		<View className="w-full h-full bg-brand-bgc">
			<FlatList
				data={[{ key: "content" }]}
				keyExtractor={(i) => i.key}
				renderItem={() => null}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: 16 }}
				ListHeaderComponent={
					<View>
						{currentStep === 0 && (
							<View>
								<Pressable
									onPress={handleSkip}
									className="bg-fuchsia-800 h-16 w-32"
								>
									<Text className="text-text font-rubik-extrabold text-lg">
										SKIP DO GRUPOWEJ
									</Text>
								</Pressable>
								<FlatList
									data={friends}
									horizontal
									nestedScrollEnabled
									keyExtractor={(item) => item.name}
									showsHorizontalScrollIndicator={false}
									ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
									renderItem={({ item }) => (
										<View className="bg-brand-dark rounded-xl px-4 py-3 flex-row items-center justify-between">
											<Text className="text-text font-rubik-medium">
												friend: {item.name}
											</Text>
											<Pressable
												onPress={() => handleAddFriendToGame(item)}
												className="bg-brand px-3 py-2 rounded-lg"
											>
												<Text className="text-text">Wybierz</Text>
											</Pressable>
										</View>
									)}
								/>

								<View style={{ height: 16 }} />

								<View>
									<Text className="text-text font-rubik mb-2">
										OTO ZNAJOMI KTÓRZYCH WYBRAŁEŚ:
									</Text>

									<FlatList
										data={friendsForGame}
										horizontal
										nestedScrollEnabled
										keyExtractor={(item) => item.name}
										showsHorizontalScrollIndicator={false}
										ItemSeparatorComponent={() => (
											<View style={{ width: 12 }} />
										)}
										renderItem={({ item }) => (
											<View className="bg-brand-dark rounded-xl px-4 py-3 flex-row items-center justify-between">
												<Text className="text-text font-rubik-medium">
													Znajomy wybrany: {item.name}
												</Text>
											</View>
										)}
									/>

									<View style={{ height: 12 }} />

									<Pressable onPress={() => getMovieIds(friendsForGame)}>
										<Text className="text-text font-rubik">Gotowe</Text>
									</Pressable>
								</View>

								<Pressable onPress={handleStart} className="w-full py-3">
									<Text className="text-text font-rubik-extrabold text-2xl text-center">
										Gotowe
									</Text>
								</Pressable>
							</View>
						)}

						{currentStep === 1 && (
							<TinderPhase sessionId={sessionId} onDone={onDone} />
						)}
						{currentStep === 2 && <GroupPhase />}
					</View>
				}
			/>
		</View>
	);
};

export default MultiStepPicker;
