import { getWatchlistItems } from "./appwrite/appwriteWatchlist";

type DBItem = {
	id: string;
	watchList_id: string;
	tmdb_id: number;
	$createdAt: string;
	$updatedAt: string;
};

export type TMDBItem = {
	id: number;
	title?: string;
	name?: string;
	english_title?: string;
	poster_path: string | null;
	overview: string;
	vote_average: number;
	release_date?: string;
	first_air_date?: string;
	genre_ids: number[];
	runtime?: number;
	media_type: "movie" | "tv";
	similar?: boolean;
	vote_count: number;
};

export type WatchlistItem = {
	db: DBItem;
	tmdb: TMDBItem;
};

export type TMDBCredits = {
	cast: {
		id: number;
		name: string;
		character: string;
		profile_path: string | null;
	}[];
};

type FetchProps = {
	type: "movie" | "tv";
	action?: "popular" | "search" | "find" | "similar";
	page?: number;
	search?: string;
	itemId?: number;
	watchlistId?: string;
};

export const tmdbConfig = {
	tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY,
	tmdbApiCode: process.env.EXPO_PUBLIC_TMDB_API_CODE,
	apiUrl: "https://api.themoviedb.org/3",
};

const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${tmdbConfig.tmdbApiCode}`,
	},
};

export async function fetchTMDBItems({
	type,
	action,
	page,
	search,
	itemId,
}: FetchProps) {
	try {
		let url = `${tmdbConfig.apiUrl}/${action}/${type}?language=pl-PL&page=${page}`;
		if (action === "similar" && itemId) {
			url = `${tmdbConfig.apiUrl}/${type}/${itemId}/similar?language=pl-PL`;
		}
		if (action === "search" && search) {
			url += `&query=${encodeURIComponent(search)}`;
		}
		if (action === "find" && itemId) {
			url = `${tmdbConfig.apiUrl}/${type}/${itemId}?language=pl-PL`;
		}
		if (action === "popular") {
			url = `${tmdbConfig.apiUrl}/${type}/popular?language=pl-PL&page=${page}`;
		}
		let res = await fetch(url, options).then((res) => res.json());
		if (action === "popular" || action === "search") {
			if (res.results && Array.isArray(res.results)) {
				res.results = res.results.map((item: any) => ({
					...item,
					media_type: type,
				}));
			}
		}

		if (action === "find" && itemId) {
			let url = `${tmdbConfig.apiUrl}/${type}/${itemId}?language=pl-PL`;
			let res = await fetch(url, options).then((r) => r.json());

			if (!res.title || !res.overview) {
				url = `${tmdbConfig.apiUrl}/${type}/${itemId}?language=en-US`;
				res = await fetch(url, options).then((r) => r.json());
			}
			return res && res.id ? res : null;
		}

		if (action === "find") {
			return res && res.id ? res : null;
		}
		return res;
	} catch (e) {
		console.log("ERROR occurs in fetchTMDBItems: ", e);
	}
}

export async function getTMDBCredits(itemId: number, type: "movie" | "tv") {
	try {
		const url = `${tmdbConfig.apiUrl}/${type}/${itemId}/credits?language=pl-PL`;
		const res = await fetch(url, options).then((res) => res.json());
		return res;
	} catch (e) {
		console.log("ERROR occurs in getTMDBCredits: ", e);
	}
}

export async function getMergedDBandTMDBItems({
	type,
	action,
	page,
	search,
	itemId,
	watchlistId,
}: FetchProps) {
	try {
		const merged: WatchlistItem[] = [];
		let DBItems: any[] = [];
		if (watchlistId) {
			DBItems = await getWatchlistItems(watchlistId);
		}
		if (DBItems.length === 0) {
			const TMDBResults = await fetchTMDBItems({
				type,
				action,
				page,
				search,
				itemId,
			});
			const TMDBItems = TMDBResults.results as TMDBItem[];
			for (let i = 0; i < TMDBItems.length; i++) {
				const tmdbItem = TMDBItems[i];
				if (!tmdbItem) continue;
				merged.push({
					db: {
						id: "",
						watchList_id: "",
						tmdb_id: tmdbItem.id,
						$createdAt: "",
						$updatedAt: "",
					},
					tmdb: {
						id: tmdbItem.id,
						title: tmdbItem.title ?? tmdbItem.name,
						english_title: tmdbItem.english_title,
						poster_path: tmdbItem.poster_path,
						overview: tmdbItem.overview,
						vote_average: tmdbItem.vote_average,
						vote_count: tmdbItem.vote_count,
						release_date: tmdbItem.release_date,
						genre_ids: tmdbItem.genre_ids,
						media_type: type,
					},
				});
			}
		}
		if (DBItems.length > 0) {
			for (let i = 0; i < DBItems.length; i++) {
				const dbItem = DBItems[i];
				const tmdbItem = await fetchTMDBItems({
					action,
					type,
					itemId: dbItem.tmdb_id,
				});
				if (!tmdbItem) continue;
				merged.push({
					db: {
						id: dbItem.$id,
						watchList_id: dbItem.watchList_id,
						tmdb_id: dbItem.tmdb_id,
						$createdAt: dbItem.$createdAt,
						$updatedAt: dbItem.$updatedAt,
					},
					tmdb: {
						id: tmdbItem.id,
						title: tmdbItem.title ?? tmdbItem.name,
						english_title: tmdbItem.english_title,
						poster_path: tmdbItem.poster_path,
						overview: tmdbItem.overview,
						vote_average: tmdbItem.vote_average,
						vote_count: tmdbItem.vote_count,
						release_date: tmdbItem.release_date,
						genre_ids: tmdbItem.genre_ids,
						media_type: type,
					},
				});
			}
		}
		return merged;
	} catch (e) {
		console.log("ERROR occurs in getMergedDBandTMDBItems: ", e);
	}
}
