import { WatchlistItem } from "@/lib/tmdb";
import React from "react";
import { FlatList, ImageSourcePropType, Text, View } from "react-native";
import { MovieTile } from "../ui/movieTile";

type Props = {
	data: WatchlistItem[];
	loading?: boolean;
	orientation?: "vertical" | "horizontal";
	columns?: number;
	scrollEnabled?: boolean;
	imagePlaceholder?: boolean;
	placeholder?: ImageSourcePropType;
	maxItems?: number;
	itemWidth?: number;
	itemHeight?: number;
	showTitle?: boolean;
	showTitleInHorizontal?: boolean;
	titleSlotHeight?: number;
};

export function MovieGrid({
	data,
	loading = false,
	orientation = "vertical",
	columns = 3,
	scrollEnabled = false,
	imagePlaceholder = false,
	placeholder,
	maxItems = 20,
	itemWidth = 120,
	itemHeight = 180,
	showTitle = true,
	showTitleInHorizontal = true,
	titleSlotHeight = 40,
}: Props) {
	if (loading) return null;
	const horizontal = orientation === "horizontal";
	const items = data.filter(Boolean).slice(0, maxItems);
	const withTitleH = horizontal && showTitle && showTitleInHorizontal;
	const listHeight = horizontal
		? itemHeight + (withTitleH ? titleSlotHeight : 0)
		: undefined;
	return (
		<FlatList
			key={horizontal ? "h" : `v-${columns}`}
			data={items}
			horizontal={horizontal}
			numColumns={horizontal ? 1 : columns}
			keyExtractor={(item) => String(item.tmdb.id)}
			style={horizontal ? { height: listHeight } : undefined}
			scrollEnabled={horizontal ? true : scrollEnabled}
			showsHorizontalScrollIndicator={false}
			showsVerticalScrollIndicator={false}
			contentContainerClassName="mt-2"
			ItemSeparatorComponent={() => (
				<View className={horizontal ? "w-2" : "h-4"} />
			)}
			columnWrapperStyle={horizontal ? undefined : { gap: 8 }}
			renderItem={({ item }) => {
				if (!item || !item.tmdb) return null;
				const wrapperStyle = horizontal
					? {
							width: itemWidth,
							height: itemHeight + (withTitleH ? titleSlotHeight : 0),
						}
					: { flex: 1 };

				return (
					<View style={wrapperStyle}>
						<View style={horizontal ? { height: itemHeight } : undefined}>
							<MovieTile
								item={item}
								imagePlaceholder={imagePlaceholder}
								placeholder={placeholder}
							/>
						</View>

						{showTitle &&
							(!horizontal || (horizontal && showTitleInHorizontal)) && (
								<View
									style={{
										height: titleSlotHeight,
										justifyContent: "center",
										paddingHorizontal: 4,
									}}
								>
									<Text
										numberOfLines={2}
										className="text-text font-rubik-medium text-xs"
									>
										{item.tmdb.title ?? item.tmdb.name}
									</Text>
								</View>
							)}
					</View>
				);
			}}
			initialNumToRender={Math.min(6, items.length)}
			removeClippedSubviews
		/>
	);
}
