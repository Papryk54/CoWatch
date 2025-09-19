import FriendStatusRow from "@/components/friendStatusRow";
import LoadingScreen from "@/components/loadingScreen";
import { getMyProfile } from "@/lib/appwrite";
import {
	addItemsToSession,
	getFriendsForGame,
	getSessionItems,
	getSessionStep,
} from "@/lib/appwrite/appwritePickerSession";
import { getWatchlistItems } from "@/lib/appwrite/appwriteWatchlist";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import EliminationPhase from "../eliminationPhase";
import GroupPhase from "../groupPhase";
import TinderPhase from "../tinderPhase";

type Friend = {
	$id: string;
	name: string;
	watchlist_main: string;
	friends: string;
};

const MultiStepPicker = () => {
	const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
	const [currentStep, setCurrentStep] = useState(0);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(false);

	const onDone = () => {
		router.replace("/(root)/(tabs)/profile");
	};

	const getMovieIds = async (friends: Friend[]) => {
		if (!sessionId) {
			return;
		}
		try {
			const me = await getMyProfile();
			const myListId = me.watchlist_main.$id;
			const myIds = (await getWatchlistItems(myListId)).documents.map(
				(d) => d.tmdb_id
			);

			const friendListIds = friends.map((f) => f.watchlist_main);
			const friendsIds = (
				await Promise.all(friendListIds.map((id) => getWatchlistItems(id)))
			).flatMap((r) => r.documents.map((d) => d.tmdb_id));

			const uniqueIds = [...new Set([...myIds, ...friendsIds])];
			const itemsInSession = await getSessionItems(sessionId);
			if (itemsInSession.length > 0) {
				return;
			} else {
				return addItemsToSession(sessionId, uniqueIds);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const load = async () => {
		try {
			setLoading(true);
			const friendsList = await getFriendsForGame(sessionId);
			const friends: Friend[] = friendsList.documents.map((doc) => ({
				$id: doc.$id,
				name: doc.name,
				watchlist_main: doc.watchlist_main.$id,
				friends: doc.friends.$id,
			}));
			setFriends(friends);
			const step = await getSessionStep(sessionId);
			await getMovieIds(friends);
			setCurrentStep(step);
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<View className="w-full h-full bg-brand-bgc">
			{loading && <LoadingScreen />}
			<View className="flex-1 p-4">
				{currentStep === 0 && (
					<>
						<View className="flex-1 justify-center items-center w-full">
							<Text className="text-text font-rubik-extrabold text-2xl mb-8 text-center">
								👥 Oczekiwanie na znajomych 👥
							</Text>
							<FlatList
								data={friends}
								keyExtractor={(item) => item.$id}
								renderItem={({ item }) => (
									<View className="flex-row items-center justify-center w-full mb-4">
										<FriendStatusRow friend={item} />
									</View>
								)}
								ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
								contentContainerStyle={{
									justifyContent: "center",
									alignItems: "center",
									flexGrow: 1,
								}}
								style={{ width: "100%" }}
							/>
						</View>
						<Pressable
							onPress={onDone}
							className="bg-brand-dark justify-center absolute bottom-0 w-full rounded-b-xl z-10 py-4 mx-4"
						>
							<Text className="text-text font-rubik-extrabold text-2xl text-center">
								Powrót
							</Text>
						</Pressable>
					</>
				)}
				{currentStep === 1 && (
					<TinderPhase sessionId={sessionId} onDone={onDone} />
				)}
				{currentStep === 2 && (
					<GroupPhase sessionId={sessionId} onDone={onDone} />
				)}
				{currentStep === 3 && (
					<EliminationPhase sessionId={sessionId} onDone={onDone} />
				)}
			</View>
		</View>
	);
};

export default MultiStepPicker;
