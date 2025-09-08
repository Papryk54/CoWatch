import { config, databases, setItemScore } from "@/lib/appwrite";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
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
		Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_KEY}`,
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
	const [showFav, setShowFav] = useState(false);
	const [showRemove, setShowRemove] = useState(false);

	useEffect(() => {
		console.log("scoresToAdd (aktualne):", scoresToAdd);
	}, [scoresToAdd]);

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
		console.log(sessionId);
		if (!sessionId || scoresToAdd.length === 0) return;

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
			onDone();
		} catch (e) {
			console.log("handleSendScores error:", e);
		}
	};

	return (
		<View className="flex-1 bg-brand-bgc items-center justify-center -mx-6 -my-6 h-screen">
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

			{loading && (
				<View className="items-center">
					<ActivityIndicator />
					<Text className="text-text mt-3">Ładuję filmy…</Text>
				</View>
			)}

			{err && <Text className="text-red-400 font-rubik">{err}</Text>}

			{done && (
				<Pressable onPress={handleSendScores}>
					<Text className="text-text font-rubik-extrabold text-xl">Gotowe</Text>
				</Pressable>
			)}

			{!loading && !err && movie && (
				<>
					<View className="flex-row justify-center mb-4 space-x-6 h-32 gap-4 absolute top-6">
						<View className="items-center">
							<Pressable
								onPress={() => setShowFav((prev) => !prev)}
								className="bg-[#D4AF37] rounded-2xl px-12 py-4 border-4 border-black"
							>
								<Text className="text-white text-4xl">💖</Text>
								<Text className="text-white font-rubik text-sm text-center">
									1/2
								</Text>
							</Pressable>
						</View>

						<View className="items-center">
							<Pressable
								onPress={() => setShowRemove((prev) => !prev)}
								className="bg-[#7E3FD5] rounded-2xl px-12 py-4 border-4 border-black"
							>
								<Text className="text-white text-4xl">💀</Text>
								<Text className="text-white font-rubik text-sm text-center">
									1/1
								</Text>
							</Pressable>
						</View>
					</View>
					<Text className="text-text font-rubik-extrabold text-2xl mt-8 mb-4 text-center px-4">
						{movie.title}
					</Text>

					<Animated.View
						{...panResponder.panHandlers}
						className="w-4/5 rounded-2xl overflow-hidden bg-brand-dark relative"
						style={{
							aspectRatio: 2 / 3,
							transform: [
								{ translateX: translate.x },
								{ translateY: translate.y },
								{ rotate },
							],
						}}
					>
						<Image
							source={{
								uri:
									TMDB.img(movie.poster_path, "w780") ??
									"https://picsum.photos/600/900",
							}}
							className="w-full h-full"
							resizeMode="cover"
						/>

						{!showInfo && (
							<Pressable
								onPress={() => setShowInfo(true)}
								className="absolute right-3 top-3 bg-black/60 rounded-full px-2.5 py-1.5"
							>
								<Text className="text-white font-rubik-extrabold">?</Text>
							</Pressable>
						)}

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
				</>
			)}
		</View>
	);
};

export default TinderPhase;
