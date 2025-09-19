import ProgressBar from "@/components/progressBar";
import {
	config,
	databases,
	getMyProfile,
	getPowerUpStatus,
	setItemScore,
	updatePowerUp,
	updateStatus,
} from "@/lib/appwrite";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	PanResponder,
	Pressable,
	Text,
	View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type TmdbMovie = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
};

type Props = {
	sessionId: string;
	onDone: () => void;
};

type Scores = {
	tmdb_id: number;
	scoreToAdd: number;
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

// ——— helpers ———
const shuffleInPlace = <T,>(arr: T[]) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

const fetchTmdbMovie = async (id: number): Promise<TmdbMovie> => {
	const res = await fetch(`${TMDB.base}/movie/${id}?language=pl-PL`, {
		headers: TMDB.headers,
	});
	if (!res.ok) throw new Error(`TMDB ${id} ${res.status}`);
	return res.json();
};

const getSessionTmdbIds = async (sessionId: string): Promise<number[]> => {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);

	const raw = (session as any)?.multiStepPickerListItems ?? [];

	const itemIds: string[] = raw
		.map((it: any) => (typeof it === "string" ? it : it?.$id))
		.filter((v: any): v is string => typeof v === "string" && v.length > 0);

	if (!itemIds.length) return [];

	const items = await Promise.all(
		itemIds.map((id) =>
			databases.getDocument(
				config.databaseId!,
				config.databaseMultiStepPickerItems!,
				id
			)
		)
	);

	const ids = Array.from(
		new Set(
			items
				.map((d: any) => d?.tmdb_id)
				.filter((n: any) => typeof n === "number")
		)
	) as number[];
	return ids;
};

const TinderPhase = ({ sessionId, onDone }: Props) => {
	const [showInfo, setShowInfo] = useState(false);
	const [index, setIndex] = useState(0);
	const [movies, setMovies] = useState<TmdbMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState<string | null>(null);
	const [scoresToAdd, setScoresToAdd] = useState<Scores[]>([]);
	const [showFavAnimation, setShowFavAnimation] = useState(false);
	const [showSkullAnimation, setShowSkullAnimation] = useState(false);
	const skullScale = useRef(new Animated.Value(0.5)).current;
	const skullOpacity = useRef(new Animated.Value(0)).current;
	const heartScale = useRef(new Animated.Value(0.5)).current;
	const heartOpacity = useRef(new Animated.Value(0)).current;
	const isPowerUpAnimating = useRef(false);

	const handlePowerUp = async (type: "fav" | "skull") => {
		if (isPowerUpAnimating.current) return;
		isPowerUpAnimating.current = true;
		try {
			const me = await getMyProfile();
			let pointsToAdd: number;
			try {
				const powerUpStatus = await getPowerUpStatus(me.$id);
				if (type === "fav") {
					if (powerUpStatus.fav <= 0) {
						isPowerUpAnimating.current = false;
						return;
					}
					pointsToAdd = 3;
				} else if (type === "skull") {
					if (powerUpStatus.skull <= 0) {
						isPowerUpAnimating.current = false;
						return;
					}
					pointsToAdd = -5;
				}
				await updatePowerUp(me.$id, sessionId, type);
			} catch (err) {
				console.log("ERROR:", err);
			}
			if (showFavAnimation || showSkullAnimation) return;

			if (type === "fav") {
				setShowFavAnimation(true);
				heartScale.setValue(0.5);
				heartOpacity.setValue(0.7);
				Animated.parallel([
					Animated.timing(heartScale, {
						toValue: 1.3,
						duration: 350,
						useNativeDriver: true,
					}),
					Animated.timing(heartOpacity, {
						toValue: 1,
						duration: 350,
						useNativeDriver: true,
					}),
				]).start(() => {
					setTimeout(() => {
						Animated.parallel([
							Animated.timing(heartScale, {
								toValue: 1.7,
								duration: 400,
								useNativeDriver: true,
							}),
							Animated.timing(heartOpacity, {
								toValue: 0,
								duration: 400,
								useNativeDriver: true,
							}),
						]).start(() => {
							setShowFavAnimation(false);
							setScoresToAdd((prev) => [
								...prev,
								{ tmdb_id: movies[index]?.id, scoreToAdd: pointsToAdd },
							]);
							setIndex((i) => i + 1);
							setShowInfo(false);
						});
					}, 800);
				});
			} else if (type === "skull") {
				setShowSkullAnimation(true);
				skullScale.setValue(0.5);
				skullOpacity.setValue(0.7);
				Animated.parallel([
					Animated.timing(skullScale, {
						toValue: 1.3,
						duration: 350,
						useNativeDriver: true,
					}),
					Animated.timing(skullOpacity, {
						toValue: 1,
						duration: 350,
						useNativeDriver: true,
					}),
				]).start(() => {
					setTimeout(() => {
						Animated.parallel([
							Animated.timing(skullScale, {
								toValue: 1.7,
								duration: 400,
								useNativeDriver: true,
							}),
							Animated.timing(skullOpacity, {
								toValue: 0,
								duration: 400,
								useNativeDriver: true,
							}),
						]).start(() => {
							setShowSkullAnimation(false);
							setScoresToAdd((prev) => [
								...prev,
								{ tmdb_id: movies[index]?.id, scoreToAdd: pointsToAdd },
							]);
							setIndex((i) => i + 1);
							setShowInfo(false);
						});
					}, 800);
				});
			}
			isPowerUpAnimating.current = false;
		} catch (err) {
			isPowerUpAnimating.current = false;
			console.log("ERROR:", err);
		}
	};

	const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
	useEffect(() => {
		translate.setValue({ x: 0, y: 0 });
	}, [index, translate]);

	const rotate = translate.x.interpolate({
		inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
		outputRange: ["-12deg", "0deg", "12deg"],
	});

	const leftOpacity = translate.x.interpolate({
		inputRange: [-SCREEN_WIDTH * 0.6, 0],
		outputRange: [1, 0],
		extrapolate: "clamp",
	});

	const rightOpacity = translate.x.interpolate({
		inputRange: [0, SCREEN_WIDTH * 0.6],
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	const vignetteOpacity = translate.x.interpolate({
		inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
		outputRange: [0.2, 0, 0.2],
		extrapolate: "clamp",
	});

	const movie = movies[index];
	const done = !loading && !err && (!movies.length || index >= movies.length);

	const load = async () => {
		try {
			setLoading(true);
			setErr(null);
			const me = await getMyProfile();
			await updatePowerUp(me.$id, sessionId, "reset");

			const tmdbIds = await getSessionTmdbIds(sessionId);
			if (!tmdbIds.length) {
				setMovies([]);
				return;
			}
			const details = await Promise.all(tmdbIds.map(fetchTmdbMovie));
			shuffleInPlace(details);
			setMovies(details);
			setIndex(0);
		} catch (e: any) {
			console.log("ERROR occurs in load:", e);
			setErr(e?.message ?? "Nie udało się pobrać filmów.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const snapAndNext = (dir: "left" | "right", currentId: number) => {
		const toX = dir === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH;
		Animated.timing(translate.x, {
			toValue: toX * 1.2,
			duration: 160,
			useNativeDriver: true,
		}).start(() => {
			if (dir === "left") {
				setScoresToAdd((prev) => [
					...prev,
					{ tmdb_id: currentId, scoreToAdd: 0 },
				]);
			}
			if (dir === "right") {
				setScoresToAdd((prev) => [
					...prev,
					{ tmdb_id: currentId, scoreToAdd: 1 },
				]);
			}
			translate.setValue({ x: 0, y: 0 });
			setIndex((i) => i + 1);
			setShowInfo(false);
		});
	};

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => !showInfo && !!movies[index],
				onMoveShouldSetPanResponder: (_, g) =>
					!showInfo && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
				onPanResponderMove: Animated.event(
					[null, { dx: translate.x, dy: translate.y }],
					{ useNativeDriver: false }
				),
				onPanResponderRelease: (_, { dx, vx }) => {
					const velocityKick =
						Math.abs(vx) > 0.75 ? Math.sign(vx) * SWIPE_THRESHOLD : 0;
					const finalDx = dx + velocityKick;

					const currentId = movies[index]?.id;
					if (currentId == null) {
						return Animated.spring(translate, {
							toValue: { x: 0, y: 0 },
							useNativeDriver: true,
							bounciness: 8,
						}).start();
					}

					if (finalDx > SWIPE_THRESHOLD) return snapAndNext("right", currentId);
					if (finalDx < -SWIPE_THRESHOLD) return snapAndNext("left", currentId);

					Animated.spring(translate, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: true,
						bounciness: 8,
					}).start();
				},
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[showInfo, translate, index, movies]
	);

	const handleSendScores = async () => {
		if (!sessionId || scoresToAdd.length === 0) return;
		setLoading(true);
		try {
			const session: any = await databases.getDocument(
				config.databaseId!,
				config.databaseMultiStepPicker!,
				sessionId
			);

			const itemIds: string[] = (session?.multiStepPickerListItems ?? [])
				.map((it: any) => (typeof it === "string" ? it : it?.$id))
				.filter((v: any): v is string => typeof v === "string" && v.length > 0);

			if (itemIds.length === 0) return;

			const items = await Promise.all(
				itemIds.map((id) =>
					databases.getDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						id
					)
				)
			);

			const byTmdb = new Map<number, { docId: string; score: number }>();
			for (const d of items as any[]) {
				const tmdb = typeof d?.tmdb_id === "number" ? d.tmdb_id : undefined;
				if (tmdb != null)
					byTmdb.set(tmdb, { docId: d.$id, score: Number(d?.score ?? 0) });
			}

			const deltas = new Map<number, number>();
			for (const { tmdb_id, scoreToAdd } of scoresToAdd) {
				deltas.set(tmdb_id, (deltas.get(tmdb_id) ?? 0) + scoreToAdd);
			}

			const updates: Promise<any>[] = [];
			for (const [tmdbId, delta] of deltas) {
				const ref = byTmdb.get(tmdbId);
				if (!ref) continue;
				updates.push(setItemScore(ref.docId, ref.score + delta));
			}

			await Promise.all(updates);

			setScoresToAdd([]);
			updateStatus(session.$id, "first_phase");
			onDone();
			setLoading(false);
		} catch (e) {
			console.log("ERROR:", e);
		}
	};

	return (
		<View className="flex-1 bg-brand-bgc items-center justify-center -mx-6 -my-6">
			{/* Pasek postępu na górze jako osobny komponent */}
			{!loading && !err && movie && (
				<ProgressBar index={index} movies={movies} />
			)}
			{!loading && !err && done && (
				<ProgressBar index={index} movies={movies} done={true} />
			)}
			<Animated.View
				pointerEvents="none"
				style={[
					{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "black",
					},
					{ opacity: vignetteOpacity },
				]}
			/>

			<Animated.View
				pointerEvents="none"
				style={[
					{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
					{ opacity: leftOpacity },
				]}
			>
				<LinearGradient
					colors={["rgba(218,77,110,0.55)", "transparent"]}
					start={{ x: 0.5, y: 1 }}
					end={{ x: 0.5, y: 0 }}
					style={{ flex: 1 }}
				>
					<Text className="text-text font-rubik-extrabold text-3xl text-center mt-12">
						🥱 Nie mam ochoty 👎
					</Text>
				</LinearGradient>
			</Animated.View>

			<Animated.View
				pointerEvents="none"
				style={[
					{ position: "absolute", right: 0, left: 0, bottom: 0, height: 120 },
					{ opacity: rightOpacity },
				]}
			>
				<LinearGradient
					colors={["rgba(27,178,139,0.55)", "transparent"]}
					start={{ x: 0.5, y: 1 }}
					end={{ x: 0.5, y: 0 }}
					style={{ flex: 1 }}
				>
					<Text className="text-text font-rubik-extrabold text-3xl text-center mt-12">
						🔥 Chce obejrzeć 🍿
					</Text>
				</LinearGradient>
			</Animated.View>

			{/* {loading && <LoadingScreen></LoadingScreen>} */}

			{err && <Text className="text-red-400 font-rubik">{err}</Text>}

			{!loading && !err && movie && (
				<View className="flex-1 items-center justify-center w-full mt-24">
					<View
						style={{
							maxWidth: "80%",
							height: (SCREEN_WIDTH < 350 ? 18 : 24) * 2 * 1.2,
							justifyContent: "center",
						}}
					>
						<Text
							className="text-text font-rubik-extrabold text-xl text-center px-4"
							style={{
								fontSize: SCREEN_WIDTH < 350 ? 18 : 24,
								lineHeight: (SCREEN_WIDTH < 350 ? 18 : 24) * 1.2,
							}}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{movie.title}
						</Text>
					</View>

					<Animated.View
						{...panResponder.panHandlers}
						className="rounded-2xl overflow-hidden relative mb-2"
						style={{
							width: "80%",
							aspectRatio: 2 / 3,
							maxHeight: SCREEN_WIDTH * 1.1,
							transform: [
								{ translateX: translate.x },
								{ translateY: translate.y },
								{ rotate },
							],
						}}
					>
						<View>
							{!showInfo && (
								<Pressable
									onPress={() => setShowInfo(true)}
									className="absolute right-3 top-3 bg-black/60 rounded-full px-2.5 py-1.5 z-10"
								>
									<Text className="text-white font-rubik-extrabold">?</Text>
								</Pressable>
							)}
							<Image
								source={{
									uri:
										TMDB.img(movie.poster_path, "w780") ??
										"https://picsum.photos/600/900",
								}}
								style={{
									width: "100%",
									aspectRatio: 2 / 3,
									resizeMode: "cover",
								}}
							/>
							{/* Animacja serca */}
							{showFavAnimation && (
								<Animated.View
									pointerEvents="none"
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: [
											{ translateX: -48 },
											{ translateY: -48 },
											{ scale: heartScale },
										],
										opacity: heartOpacity,
										zIndex: 20,
									}}
								>
									<Ionicons
										name="heart"
										size={96}
										color="#FF3B6A"
										style={{ textShadowColor: "#fff", textShadowRadius: 8 }}
									/>
								</Animated.View>
							)}
							{/* Animacja czaszki */}
							{showSkullAnimation && (
								<Animated.View
									pointerEvents="none"
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: [
											{ translateX: -48 },
											{ translateY: -48 },
											{ scale: skullScale },
										],
										opacity: skullOpacity,
										zIndex: 20,
									}}
								>
									<Ionicons
										name="skull"
										size={96}
										color="#C02626"
										style={{ textShadowColor: "#fff", textShadowRadius: 8 }}
									/>
								</Animated.View>
							)}
						</View>

						{showInfo && (
							<Pressable
								onPress={() => setShowInfo(false)}
								className="absolute inset-0 bg-black/70 items-center justify-center p-5"
							>
								<Text className="text-text font-rubik text-base leading-6 text-center">
									{movie.overview || "Brak opisu."}
								</Text>
							</Pressable>
						)}
					</Animated.View>

					<View className="flex-row justify-between items-center mb-8 w-[80%]">
						<View className="flex-1 items-center">
							<Pressable
								onPress={() => handlePowerUp("fav")}
								className="rounded-2xl w-full"
								style={{
									paddingVertical: 12,
									opacity: showFavAnimation || showSkullAnimation ? 0.5 : 1,
								}}
								disabled={showFavAnimation || showSkullAnimation}
							>
								<View className="items-center flex justify-center ">
									<Text className="text-text text-5xl mb-2">💖</Text>
								</View>
							</Pressable>
						</View>
						<View className="flex-1 items-center ml-2">
							<Pressable
								onPress={() => handlePowerUp("skull")}
								className="rounded-2xl w-full"
								style={{
									paddingVertical: 12,
									opacity: showFavAnimation || showSkullAnimation ? 0.5 : 1,
								}}
								disabled={showFavAnimation || showSkullAnimation}
							>
								<View className="items-center flex justify-center">
									<Text className="text-text text-5xl">💀</Text>
								</View>
							</Pressable>
						</View>
					</View>
				</View>
			)}
			{done && (
				<View
					style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
					className="p-4"
				>
					<Pressable
						onPress={handleSendScores}
						className="bg-brand rounded-2xl items-center justify-center p-4"
						style={{ minHeight: 56 }}
					>
						<Text className="text-text font-rubik-extrabold text-xl">
							Gotowe
						</Text>
					</Pressable>
				</View>
			)}
		</View>
	);
};

export default TinderPhase;
