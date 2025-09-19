import { getMyProfile, updateUserName } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

const SetUserName = () => {
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [searchId, setSearchId] = useState("");

	const load = async () => {
		try {
			const me = await getMyProfile();
			setSearchId(me.searchId);
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetName = async () => {
		setLoading(true);
		try {
			await updateUserName(username.trim());
			await load();
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	});

	return (
		<Modal visible={searchId === "newuser"} transparent animationType="fade">
			<View className="flex-1 justify-center items-center bg-black/60">
				{searchId === "newuser" && (
					<View className="absolute top-[50%] -translate-y-1/2 bg-brand-dark rounded-3xl mx-4 justify-center items-center">
						<View className="px-8 py-8 items-center justify-between">
							<Text className="text-white text-2xl font-bold mb-5 text-center">
								Zanim zaczniemy, ustaw swoją nazwę użytkownika
							</Text>
							<TextInput
								value={username}
								onChangeText={setUsername}
								placeholder="Wpisz nazwę"
								placeholderTextColor="#999"
								className="bg-white/10 text-white px-4 py-3 rounded-xl mb-5 w-80 text-base"
							/>
							<Pressable
								className={`bg-brand-accent px-6 py-3 rounded-xl items-center mt-1 ${loading || !username.trim() ? "opacity-70" : "opacity-100"}`}
								onPress={handleSetName}
								disabled={loading || !username.trim()}
							>
								<Text className="text-white font-bold text-base">
									{loading ? "Ustawianie..." : "Ustaw nazwę"}
								</Text>
							</Pressable>
						</View>
					</View>
				)}
			</View>
		</Modal>
	);
};

export default SetUserName;
