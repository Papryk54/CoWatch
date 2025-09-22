import ProgressBar from "@/components/ui/progressBar";
import LoadingScreen from "@/components/utils/loadingScreen";
import { config, databases } from "@/lib/appwrite";
import {
	getSessionItems,
	setItemScore,
	updateStatus,
} from "@/lib/appwrite/appwritePickerSession";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

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
	id: string;
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

const GroupPhase = ({ sessionId, onDone }: Props) => {
	const [rankings, setRankings] = useState<Record<number, number>>({});
	const [order, setOrder] = useState(1);
	const [movies, setMovies] = useState<TmdbMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState<string | null>(null);
	const [numberOfGroups, setNumberOfGroups] = useState<number>(0);
	const [scoresToAdd, setScoresToAdd] = useState<Scores[]>([]);

	const load = useMemo(
		() => async () => {
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
				setRankings({});
				setNumberOfGroups(Math.floor(details.length / 4));
				setOrder(1);
			} catch (e: any) {
				setErr(e?.message ?? "Nie udało się pobrać filmów.");
			} finally {
				setLoading(false);
			}
		},
		[sessionId]
	);

	useEffect(() => {
		load();
	}, [load]);

	useEffect(() => {
		setGroupIndex(0);
	}, []);

	const prepareGroups = (movies: TmdbMovie[], g4: number) => {
		let arr = [...movies];
		const groups: TmdbMovie[][] = [];

		for (let i = 0; i < g4; i++) {
			groups.push(arr.splice(0, 4));
		}
		return groups;
	};

	const groups = useMemo(
		() => prepareGroups(movies, numberOfGroups),
		[movies, numberOfGroups]
	);
	const [groupIndex, setGroupIndex] = useState(0);
	const current = groups[groupIndex] ?? [];

	useEffect(() => {
		setGroupIndex(0);
	}, [movies]);

	const handleSelect = (id: number) => {
		if (rankings[id]) return;
		setRankings((prev) => ({ ...prev, [id]: order }));
		setOrder((prev) => prev + 1);
	};

	const handleReset = () => {
		setRankings({});
		setOrder(1);
	};

	const allSelected =
		current.length > 0 && current.every((m) => rankings[m.id]);

	const handleNext = () => {
		if (!allSelected) return;
		handleAddScore(rankings);
		setRankings({});
		setOrder(1);
		setGroupIndex((prev) => prev + 1);
	};

	const handleAddScore = async (rankings: Record<number, number>) => {
		const choices = Object.entries(rankings).map(([id, rank]) => ({
			tmdb_id: Number(id),
			rank: rank,
		}));
		const items = await getSessionItems(sessionId);

		for (let i = 0; i < choices.length; i++) {
			const reviewedMovie = items.find(
				(item: any) => item.tmdb_id === choices[i].tmdb_id
			);
			if (choices[i].rank === 1) {
				setScoresToAdd((prev) => [
					...prev,
					{ id: reviewedMovie.$id, scoreToAdd: 4 },
				]);
			} else if (choices[i].rank === 2) {
				setScoresToAdd((prev) => [
					...prev,
					{ id: reviewedMovie.$id, scoreToAdd: 3 },
				]);
			} else if (choices[i].rank === 3) {
				setScoresToAdd((prev) => [
					...prev,
					{ id: reviewedMovie.$id, scoreToAdd: 2 },
				]);
			} else if (choices[i].rank === 4) {
				setScoresToAdd((prev) => [
					...prev,
					{ id: reviewedMovie.$id, scoreToAdd: 1 },
				]);
			}
		}
	};

	const handleEnd = async () => {
		setLoading(true);
		await Promise.all(
			scoresToAdd.map((item) => setItemScore(item.id, item.scoreToAdd))
		);
		await updateStatus(sessionId, "second_phase");
		onDone();
		setLoading(false);
	};

	return (
		<View className="flex-1 items-center justify-center align-middle -mx-4 -my-4">
			{!loading && !err && groupIndex <= groups.length - 1 && (
				<ProgressBar index={groupIndex} movies={groups} />
			)}
			{groupIndex > groups.length - 1 && (
				<ProgressBar index={groupIndex} movies={groups} done={true} />
			)}
			{groupIndex > groups.length - 1 && (
				<View className="w-full px-2 justify-center items-center align-middle">
					<Text className="font-rubik-extrabold text-text text-center text-base">
						Zapisz swoje wybory i przejdź do następnej fazy
					</Text>
				</View>
			)}

			{loading && <LoadingScreen></LoadingScreen>}

			{err && <Text className="text-red-400 font-rubik mt-4">{err}</Text>}

			{!loading && !err && movies.length === 0 && (
				<Text className="text-text font-rubik mt-4">Brak filmów w sesji.</Text>
			)}

			{!loading &&
				!err &&
				movies.length > 0 &&
				groupIndex <= groups.length - 1 && (
					<View className="justify-center flex-1">
						<View className="flex-row flex-wrap justify-between w-full p-6 align-middle items-center ">
							{current.map((m) => (
								<Pressable
									key={m.id}
									onPress={() => handleSelect(m.id)}
									className="w-[48%] aspect-[2/3] bg-brand-dark rounded-2xl items-center justify-center mb-4 overflow-hidden relative"
								>
									<Image
										source={{
											uri:
												TMDB.img(m.poster_path, "w780") ??
												"https://picsum.photos/600/900",
										}}
										className="w-full h-full"
										resizeMode="cover"
									/>
									<View className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-black/35">
										<Text
											numberOfLines={1}
											className="font-rubik text-text text-sm text-center"
										>
											{m.title}
										</Text>
									</View>
									{rankings[m.id] && (
										<View className="absolute inset-0 bg-black/60 rounded-2xl items-center justify-center">
											<Text className="font-rubik-extrabold text-4xl text-white">
												{rankings[m.id]}
											</Text>
										</View>
									)}
								</Pressable>
							))}
						</View>
					</View>
				)}
			{groupIndex <= groups.length - 1 && (
				<View className="flex-row items-center justify-between absolute bottom-0 mb-8 w-full p-6">
					<Pressable
						onPress={handleReset}
						className="bg-alerts-error rounded-2xl w-14 h-14 items-center justify-center mr-3"
					>
						<Text className="text-white font-rubik-extrabold">↺</Text>
					</Pressable>

					<Pressable
						disabled={!allSelected}
						onPress={handleNext}
						className={`flex-1 rounded-2xl py-4 items-center ${
							allSelected ? "bg-brand" : "bg-brand-dark opacity-60"
						}`}
					>
						<Text className="font-rubik-extrabold text-lg text-text">
							Dalej
						</Text>
					</Pressable>
				</View>
			)}

			{groupIndex > groups.length - 1 && (
				<View className="flex-row items-center absolute bottom-0 justify-between px-2 py-4 mb-4 w-full">
					<Pressable
						onPress={handleEnd}
						className={`flex-1 rounded-2xl py-4 items-center bg-brand`}
					>
						<Text className="font-rubik-extrabold text-lg text-text">
							Zakończ
						</Text>
					</Pressable>
				</View>
			)}
		</View>
	);
};

export default GroupPhase;
