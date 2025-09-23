import React, { useEffect, useRef } from "react";
import { Animated, FlatList, Text, View } from "react-native";

const WatchlistLoading: React.FC<{
	itemWidth?: number;
	itemHeight?: number;
	titleSlotHeight?: number;
	orientation?: "horizontal" | "vertical";
	columns?: number;
}> = ({
	itemWidth = 120,
	itemHeight = 180,
	titleSlotHeight = 40,
	orientation = "horizontal",
}) => {
	// Animacja migotania
	const opacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.5,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, [opacity]);
	try {
		const placeholders = Array.from({ length: 6 }, (_, i) => i);
		const horizontal = orientation === "horizontal";

		const wrapperStyle = horizontal
			? {
					width: itemWidth,
					height: itemHeight + titleSlotHeight,
					marginRight: 10,
				}
			: { flex: 1 };

		return (
			<FlatList
				data={placeholders}
				horizontal={horizontal}
				keyExtractor={(item) => item.toString()}
				renderItem={() => (
					<View style={wrapperStyle}>
						<Animated.View
							style={{
								width: itemWidth,
								height: itemHeight,
								borderRadius: 16,
								opacity,
							}}
							className="bg-gray-600 mr-4"
						/>
						<View
							style={{
								height: titleSlotHeight,
								justifyContent: "center",
								paddingHorizontal: 4,
							}}
						>
							<Text
								numberOfLines={2}
								className="text-text font-rubik-medium text-xs text-center"
							>
                Ładowanie...
							</Text>
						</View>
					</View>
				)}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					rowGap: orientation === "vertical" ? 8 : undefined,
				}}
			/>
		);
	} catch (e) {
		console.log("ERROR occurs in WatchlistLoading: ", e);
		return null;
	}
};

export default WatchlistLoading;
