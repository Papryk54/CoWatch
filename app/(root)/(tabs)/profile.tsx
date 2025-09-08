import { getMyFriends, getSessionsByUser } from "@/lib/appwrite";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";

const Profile = () => {
	const [username, setUsername] = useState("");
	const [friends, setFriends] = useState<any[]>([]);
	const [sessions, setSessions] = useState<any[]>([]);

	const goToSession = (sessionId: string) => {
		router.push({
			pathname: "/(root)/(flow)/multiStepPicker/[sessionId]",
			params: { sessionId },
		});
	};
	const load = async () => {
		try {
			const friendsRes = await getMyFriends();
			setFriends(friendsRes?.documents ?? []);

			const sessionsRes = await getSessionsByUser();
			setSessions(sessionsRes?.documents ?? []);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<View className="flex-1 bg-brand-bgc p-6">
			<FlatList
				data={[{ key: "content" }]}
				keyExtractor={(i) => i.key}
				renderItem={() => null}
				ListHeaderComponent={
					<View>
						<Text className="text-text text-2xl font-bold mb-6 text-center">
							Ustaw profil
						</Text>

						<Text className="text-text text-base mb-2">Nazwa użytkownika</Text>
						<TextInput
							value={username}
							onChangeText={setUsername}
							placeholder="Wpisz swoją nazwę"
							placeholderTextColor="#999"
							className="bg-white/10 text-text px-4 py-3 rounded-xl mb-6"
						/>

						<FlatList
							data={friends}
							horizontal
							nestedScrollEnabled
							keyExtractor={(item) => item.$id ?? item.name}
							renderItem={({ item }) => (
								<View className="bg-brand-dark rounded-xl px-4 py-3 flex-row items-center justify-between mr-2">
									<Text className="text-text font-rubik-medium">
										friend: {item.name}
									</Text>
								</View>
							)}
						/>

						<View className="bg-brand-dark rounded-xl p-4 mt-6">
							<Text className="text-text font-rubik-medium mb-3">
								Moje rozpoczęte pickery
							</Text>

							{sessions.length === 0 ? (
								<Text className="text-text/80 mb-3">
									Brak rozpoczętych sesji
								</Text>
							) : (
								<FlatList
									data={sessions}
									keyExtractor={(s) => s.$id}
									renderItem={({ item }) => (
										<View className="bg-white/5 rounded-lg px-3 py-2 mb-2">
											<Text className="text-text font-rubik-medium">
												{item.title ?? "Sesja"}
											</Text>
											<Button
												title="Wznów"
												onPress={() => goToSession(item.$id)}
												color="#4282E8"
											/>
										</View>
									)}
								/>
							)}
						</View>
					</View>
				}
			/>
		</View>
	);
};

export default Profile;
