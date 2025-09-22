import {
	addUserToFriends,
	findProfileById,
} from "@/lib/appwrite/appwriteFriends";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

const Friends: React.FC = () => {
	const [searchId, setSearchId] = useState("");
	const [friend, setFriend] = useState<any | null>(null);
	const [searching, setSearching] = useState(false);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	const handleSearch = async () => {
		const q = searchId.trim();
		setError(null);
		setInfo(null);
		setFriend(null);
		if (!q) {
			setError("Podaj accountId.");
			return;
		}
		setSearching(true);
		try {
			const doc = await findProfileById(q);
			if (doc) {
				setFriend(doc);
			} else setError("Nie znaleziono użytkownika.");
		} catch (e) {
			console.log(e);
			setError("Błąd podczas wyszukiwania.");
		} finally {
			setSearching(false);
		}
	};

	const handleAdd = async () => {
		if (!searchId.trim() || !friend) return;
		setAdding(true);
		setError(null);
		setInfo(null);
		try {
			await addUserToFriends(searchId.trim());
			setInfo("Dodano do znajomych ✅");
		} catch (e) {
			setError("Nie udało się dodać.");
			console.log(e);
		} finally {
			setAdding(false);
		}
	};

	return (
		<View className="gap-3 mb-12">
			<Text className="text-text font-rubik-medium">Wyszukaj:</Text>

			<View className="flex-row items-center gap-2">
				<TextInput
					value={searchId}
					onChangeText={setSearchId}
					onSubmitEditing={handleSearch}
					placeholder="Wpisz accountId…"
					placeholderTextColor="#DDDDDD88"
					autoCapitalize="none"
					className="flex-1 bg-brand-dark rounded-xl px-4 py-3 font-rubik text-text"
				/>
				<Pressable
					onPress={handleSearch}
					disabled={searching}
					className="bg-brand px-4 py-3 rounded-xl"
				>
					{searching ? (
						<ActivityIndicator />
					) : (
						<Text className="text-text font-rubik-semibold">Szukaj</Text>
					)}
				</Pressable>
			</View>

			{error && <Text className="text-[tomato]">{error}</Text>}
			{info && <Text className="text-[#1BB28B]">{info}</Text>}

			{friend && (
				<View className="flex-row items-center justify-between bg-brand-dark rounded-xl px-4 py-3 mt-2">
					<View>
						<Text className="text-text font-rubik-medium">{friend.name}</Text>
						<Text className="text-text/60 text-xs">{friend.searchId}</Text>
					</View>
					<Pressable
						onPress={handleAdd}
						disabled={adding}
						className="bg-brand px-3 py-2 rounded-lg"
					>
						{adding ? (
							<ActivityIndicator />
						) : (
							<Text className="text-text font-rubik-semibold">Dodaj</Text>
						)}
					</Pressable>
				</View>
			)}
		</View>
	);
};

export default Friends;
