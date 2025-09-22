import { WatchlistItem } from "@/lib/tmdb";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Animated,
	Image,
	ImageBackground,
	ImageSourcePropType,
	Text,
	View,
} from "react-native";

type Props = {
	item: WatchlistItem;
	imagePlaceholder?: boolean;
	placeholder?: ImageSourcePropType;
};

export function MovieTile({ item, placeholder }: Props) {
	const [pressed, setPressed] = useState(false);
	const [fadeAnimTitle] = useState(new Animated.Value(0));
	const [fadeAnimRating] = useState(new Animated.Value(1));

	const ratingText = Number.isFinite(item.tmdb.vote_average)
		? (Math.round(item.tmdb.vote_average * 10) / 10).toFixed(0)
		: "-";

	const src = item.tmdb.poster_path
		? {
				uri: `https://image.tmdb.org/t/p/w500${item.tmdb.poster_path}`,
			}
		: placeholder
			? placeholder
			: require("../../assets/images/posters/moviePoster7.png");

	useEffect(() => {
		Animated.timing(fadeAnimTitle, {
			toValue: pressed ? 1 : 0,
			duration: 400,
			useNativeDriver: true,
		}).start();
		Animated.timing(fadeAnimRating, {
			toValue: pressed ? 0 : 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [pressed]);

	return (
		<View
			className="rounded-2xl overflow-hidden"
			style={{ width: "100%", aspectRatio: 2 / 3 }}
			onStartShouldSetResponder={() => true}
			onResponderGrant={() => setPressed(true)}
			onResponderRelease={() => setPressed(false)}
			onResponderTerminate={() => setPressed(false)}
		>
			<Link href={`/(root)/properties/${item.tmdb.id}/?type=${item.tmdb.media_type}`}>
				<ImageBackground
					source={src}
					className="w-full h-full"
					resizeMode="cover"
				>
					<View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-black/60 absolute top-2 right-2">
						<Text className="font-rubik-semibold text-text text-xs leading-none ">
							{ratingText}
						</Text>
						<Image
							source={require("../../assets/icons/rating.png")}
							className="w-5 h-5"
							resizeMode="contain"
						/>
					</View>
				</ImageBackground>
			</Link>
		</View>
	);
}
