import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	Image,
	Modal,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type WinnerModalProps = {
	tmdb_id: number;
	isOpen: boolean;
	onClose: () => void;
};

type Movie = {
	title: string;
	poster_path: string | null;
};

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

export const WinnerModal: React.FC<WinnerModalProps> = ({
	tmdb_id,
	isOpen,
	onClose,
}) => {
	const [movie, setMovie] = useState<Movie | null>(null);
	const [loading, setLoading] = useState(false);
	const scaleAnim = useRef(new Animated.Value(0.7)).current;
	const glowAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const fetchWinner = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${TMDB.base}/movie/${tmdb_id}`, {
					headers: TMDB.headers,
				});
				const data = await res.json();
				setMovie({
					title: data.title,
					poster_path: data.poster_path,
				});
			} catch (e) {
				console.log("ERROR occurs in fetchWinner: ", e);
			} finally {
				setLoading(false);
			}
		};

		if (isOpen && tmdb_id) {
			fetchWinner();
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
				friction: 5,
			}).start();
			Animated.loop(
				Animated.sequence([
					Animated.timing(glowAnim, {
						toValue: 1,
						duration: 800,
						useNativeDriver: false,
					}),
					Animated.timing(glowAnim, {
						toValue: 0,
						duration: 800,
						useNativeDriver: false,
					}),
				])
			).start();
		} else {
			scaleAnim.setValue(0.7);
			glowAnim.setValue(0);
			setMovie(null);
		}
	}, [tmdb_id, isOpen]);

	const glowShadow = glowAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["rgba(42, 21, 71, 0.8)", "rgba(126, 63, 213, 1)"],
	});

	return (
		<Modal
			visible={isOpen}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View className={`flex-1 bg-brand-dark justify-center items-center`}>
				<Animated.View
					className={`bg-alerts-warning/80 rounded-2xl p-8 min-w-[320px] items-center shadow-lg`}
					style={{ transform: [{ scale: scaleAnim }] }}
				>
					<Text className={`text-2xl text-gray-900 mb-6 font-rubik-extrabold`}>
						Wspólnie wybraliście:
					</Text>
					{loading ? (
						<ActivityIndicator size="large" color="gold" />
					) : movie ? (
						<>
							<Animated.View
								className={`mb-6 rounded-xl p-1.5 items-center justify-center`}
								style={{
									shadowColor: "#7E3FD5",
									shadowOpacity: 1,
									shadowRadius: 24,
									shadowOffset: { width: 0, height: 0 },
									backgroundColor: glowShadow,
								}}
							>
								<Image
									source={{
										uri: TMDB.img(movie.poster_path, "w500"),
									}}
									className={`w-[220px] h-[330px] rounded-xl`}
									resizeMode="cover"
								/>
							</Animated.View>
							<Text
								className={`text-lg text-gray-900 font-rubik-semibold mt-2 text-center`}
							>
								{movie.title}
							</Text>
							<Text
								className={`text-lg text-gray-700 font-rubik-light text-center`}
							>
								Miłego seansu!
							</Text>
						</>
					) : (
						<Text>Ładowanie zwycięzcy...</Text>
					)}
					<TouchableOpacity
						className={`mt-8 py-3 px-8 rounded bg-brand-accent items-center shadow`}
						onPress={onClose}
					>
						<Text className={`text-base text-gray-900 font-rubik-bold`}>Zakończ</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</Modal>
	);
};
