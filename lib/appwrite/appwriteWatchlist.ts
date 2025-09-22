import { Query } from "react-native-appwrite";
import { account, config, databases, getMyProfile } from "../appwrite";

export async function getMyWatchlists() {
	const me = await account.get();

	return databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlist!,
		[Query.equal("user_id", me.$id)]
	);
}

export async function getCustomWatchlists() {
	const me = await account.get();

	const result = await databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlist!,
		[Query.equal("user_id", me.$id), Query.equal("is_default", false)]
	);
	return result.documents;
}

export async function getDefaultWatchlist() {
	try {
		const me = await account.get();

		const result = await databases.listDocuments(
			config.databaseId!,
			config.databaseWatchlist!,
			[Query.equal("user_id", me.$id), Query.equal("is_default", true)]
		);
		const defaultWatchlist = result.documents[0];
		return defaultWatchlist;
	} catch (e) {
		console.log("ERROR occurs in getDefaultWatchlist: ", e);
		return null;
	}
}

export async function createCustomWatchlist(name: string, tmdb_id?: number) {
	try {
		const me = await getMyProfile();
		const watchlist = await databases.createDocument(
			config.databaseId!,
			config.databaseWatchlist!,
			"unique()",
			{
				user_id: me.$id,
				name,
				is_default: false,
			}
		);
		if (tmdb_id) {
			await addToWatchlist(watchlist.$id, tmdb_id);
		}
		return watchlist;
	} catch (e) {
		console.log("ERROR occurs in createCustomWatchlist: ", e);
		return null;
	}
}

export async function getWatchlistItems(watchList_id: string) {
	const item = await databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlistItems!,
		[Query.equal("watchList_id", watchList_id)]
	);
	return item.documents;
}

export async function addToWatchlist(watchList_id: string, tmdb_id: number) {
	const docId = `${watchList_id}_${tmdb_id}`;
	try {
		const item = await databases.createDocument(
			config.databaseId!,
			config.databaseWatchlistItems!,
			docId,
			{ watchList_id, tmdb_id }
		);

		const current = await databases.getDocument(
			config.databaseId!,
			config.databaseWatchlist!,
			watchList_id
		);
		return await databases.updateDocument(
			config.databaseId!,
			config.databaseWatchlist!,
			watchList_id,
			{
				watchListItems: [...current.watchListItems, item.$id],
			}
		);
	} catch (e) {
		console.log("ERROR: ", e);
	}
}
