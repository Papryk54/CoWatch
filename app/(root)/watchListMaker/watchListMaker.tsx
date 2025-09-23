import {
	createCustomWatchlist,
	getDefaultWatchlist,
} from "@/lib/appwrite/appwriteWatchlist";
import { getMergedDBandTMDBItems, WatchlistItem } from "@/lib/tmdb";
import { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	ImageBackground,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

const WatchListMaker = () => {
	const [items, setItems] = useState<WatchlistItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<WatchlistItem[]>([]);
	const [listName, setListName] = useState("");

	const load = async () => {
		const defaultList = await getDefaultWatchlist();
		const WatchListItems = await getMergedDBandTMDBItems({
			type: "movie",
			action: "find",
			watchlistId: defaultList?.$id,
		});
		WatchListItems?.filter(Boolean).slice(0, 30);
		setItems(WatchListItems ?? []);
	};

	useEffect(() => {
		load();
	}, []);

	const handleSelect = (item: WatchlistItem) => {
		setSelectedItems((prev) => {
			if (prev.find((i) => i.tmdb.id === item.tmdb.id)) {
				return prev.filter((i) => i.tmdb.id !== item.tmdb.id);
			} else {
				return [...prev, item];
			}
		});
	};

	const handleCreateList = async (selectedItems?: any[]) => {
		if (!listName) return;
		if (!selectedItems || selectedItems.length === 0) return;
		for (let i = 0; i < selectedItems.length; i++) {
			await createCustomWatchlist(listName, selectedItems[i]?.tmdb.id);
		}
	};

	return (
		<View className="flex-1 bg-brand-bgc p-4 h-full pb-20">
			{selectedItems.length > 0 && (
				<Pressable
					className="absolute bottom-2 rounded-xl w-full p-4 ml-4 z-50 bg-brand"
					onPress={() => handleCreateList(selectedItems)}
				>
					<Text className="text-text text-2xl text-center font-rubik-bold">
						Stwórz nową listę
					</Text>
				</Pressable>
			)}
			{selectedItems.length === 0 && (
				<Pressable
					className="absolute bottom-2 rounded-xl w-full p-4 ml-4 z-50 bg-brand"
					onPress={() => handleCreateList()}
				>
					<Text className="text-text text-2xl text-center font-rubik-bold">
						Chce czegoś nowego
					</Text>
				</Pressable>
			)}
			<TextInput
				placeholder="Enter watchlist name"
				placeholderTextColor={"#888"}
				className="bg-gray-800 text-text p-2 rounded mb-4"
				value={listName}
				onChangeText={setListName}
			/>
			<FlatList
				data={[]}
				ListHeaderComponent={
					<>
						<Text className="text-text font-bold text-lg mb-4">
							Chcesz dodać coś z twojej listy?
						</Text>
						<FlatList
							keyExtractor={(item) => String(item.tmdb.id)}
							data={items}
							numColumns={3}
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							contentContainerClassName="mt-2"
							ItemSeparatorComponent={() => <View className="h-4" />}
							columnWrapperStyle={{ gap: 8 }}
							renderItem={({ item }) => {
								const wrapperStyle = { flex: 1 };
								const isSelected = selectedItems.some(
									(i) => i.tmdb.id === item.tmdb.id
								);

								return (
									<Pressable
										onPress={() => handleSelect(item)}
										style={wrapperStyle}
									>
										<View
											className={`rounded-2xl overflow-hidden border-2 relative ${
												isSelected
													? "border-brand-accent"
													: "border-transparent"
											}`}
											style={{ width: "100%", aspectRatio: 2 / 3 }}
										>
											{isSelected && (
												<Image
													source={require("@/assets/icons/like.png")}
													className="absolute top-1 right-1 w-8 h-8 z-30"
													resizeMode="contain"
												/>
											)}
											<ImageBackground
												className="w-full h-full"
												resizeMode="cover"
												source={{
													uri: `https://image.tmdb.org/t/p/w500${item.tmdb.poster_path}`,
												}}
											></ImageBackground>
										</View>
										<Text
											className="text-text font-rubik-medium text-xs mt-2"
											numberOfLines={2}
										>
											{item.tmdb.title ?? item.tmdb.name}
										</Text>
									</Pressable>
								);
							}}
						/>
					</>
				}
				renderItem={null}
			></FlatList>
		</View>
	);
};

export default WatchListMaker;
