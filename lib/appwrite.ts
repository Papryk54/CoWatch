import {
	Account,
	AppwriteException,
	Avatars,
	Client,
	Databases,
	ID,
	OAuthProvider,
	Query,
	Storage,
} from "react-native-appwrite";

import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
	platform: "com.basement.cowatch",
	endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
	projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
	databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
	databaseUser: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_USER,
	databaseFriends: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_FRIENDS,
	databaseWatchlist: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_WATCHLIST,
	databaseWatchlistItems:
		process.env.EXPO_PUBLIC_APPWRITE_DATABASE_WATCHLIST_ITEMS,
	databaseMultiStepPicker:
		process.env.EXPO_PUBLIC_APPWRITE_DATABASE_MULTI_STEP_PICKER,
	databaseMultiStepPickerItems:
		process.env.EXPO_PUBLIC_APPWRITE_DATABASE_MULTI_STEP_PICKER_ITEMS,
};

export const client = new Client();
client
	.setEndpoint(config.endpoint!)
	.setProject(config.projectId!)
	.setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// USERS

export async function login() {
	try {
		try {
			await account.get();
			return true;
		} catch {}
		const redirectUri = Linking.createURL("/");

		const response = await account.createOAuth2Token(
			OAuthProvider.Google,
			redirectUri
		);
		if (!response) throw new Error("Create OAuth2 token failed");

		const browserResult = await openAuthSessionAsync(
			response.toString(),
			redirectUri
		);
		if (browserResult.type !== "success")
			throw new Error("Create OAuth2 token failed");

		const url = new URL(browserResult.url);
		const secret = url.searchParams.get("secret")?.toString();
		const userId = url.searchParams.get("userId")?.toString();
		if (!secret || !userId) throw new Error("Create OAuth2 token failed");

		const session = await account.createSession(userId, secret);
		if (!session) throw new Error("Failed to create session");
		createNewUser(userId);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function logout() {
	try {
		const result = await account.deleteSession("current");
		return result;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function getCurrentUser() {
	try {
		const result = await account.get();
		if (result.$id) {
			const userAvatar = avatar.getInitials(result.name);

			return {
				...result,
				avatar: userAvatar.toString(),
			};
		}

		return null;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function createNewUser(userId: string) {
	try {
		const defaultWL = await databases.createDocument(
			config.databaseId!,
			config.databaseWatchlist!,
			"unique()",
			{
				user_id: userId,
				name: "Do obejrzenia",
				is_default: true,
			}
		);

		const friendList = await createNewFriendsList(userId);

		const result = await databases.createDocument(
			config.databaseId!,
			config.databaseUser!,
			"unique()",
			{
				accountId: userId,
				name: "New User",
				watchList: [defaultWL.$id],
				friends_list: friendList,
			}
		);
		return result;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function ensureMyProfile() {
	const me = await account.get();
	const owner = me.$id;
	console.log("ensureMyProfile", owner);

	const res = await databases.listDocuments(
		config.databaseId!,
		config.databaseUser!,
		[Query.equal("accountId", owner), Query.limit(1)]
	);
	if (res.documents.length > 0) {
		return res.documents[0];
	}
	const doc = await databases.createDocument(
		config.databaseId!,
		config.databaseUser!,
		ID.unique(),
		{
			accountId: owner,
			name: me.name || "New User",
		}
	);

	return doc;
}

export async function getMyProfile() {
	const me = await account.get();
	const res = await databases.listDocuments(
		config.databaseId!,
		config.databaseUser!,
		[Query.equal("accountId", me.$id), Query.limit(1)]
	);
	return res.documents[0] ?? null;
}

export async function updateMyName(newName: string) {
	const me = await account.get();
	const res = await databases.listDocuments(
		config.databaseId!,
		config.databaseUser!,
		[Query.equal("accountId", me.$id), Query.limit(1)]
	);
	if (res.documents.length === 0) throw new Error("Profile not found");
	const doc = res.documents[0];
	return databases.updateDocument(
		config.databaseId!,
		config.databaseUser!,
		doc.$id,
		{ name: newName }
	);
}

// WATCHLIST

export async function getWatchlistItems(watchList_id: string) {
	return databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlistItems!,
		[Query.equal("watchList_id", watchList_id)]
	);
}

export async function addToWatchlist(watchList_id: string, tmdb_id: number) {
	const docId = `${watchList_id}_${tmdb_id}`;
	try {
		return await databases.createDocument(
			config.databaseId!,
			config.databaseWatchlistItems!,
			docId,
			{ watchList_id, tmdb_id }
		);
	} catch (e) {
		const err = e as AppwriteException;
		if (err.code === 409) {
			const res = await databases.listDocuments(
				config.databaseId!,
				config.databaseWatchlistItems!,
				[
					Query.equal("watchList_id", watchList_id),
					Query.equal("tmdb_id", tmdb_id),
				]
			);
			return res.documents[0];
		}
		throw err;
	}
}

// FRIENDS

export async function createNewFriendsList(user_id: string) {
	try {
		const res = await databases.createDocument(
			config.databaseId!,
			config.databaseFriends!,
			"unique()",
			{
				user_id: user_id,
				friends_ids: [],
			}
		);
		return res.$id;
	} catch {}
}

export async function findProfileById(profileId: string) {
	try {
		const res = await databases.listDocuments(
			config.databaseId!,
			config.databaseUser!,
			[Query.equal("$id", profileId), Query.limit(1)]
		);
		return res.documents[0];
	} catch {}
}

export async function addUserToFriends(friendId: string) {
	const me = await getMyProfile();
	const friendListId = me.friends_list.$id;

	const current = await databases.getDocument(
		config.databaseId!,
		config.databaseFriends!,
		friendListId
	);

	const updated = await databases.updateDocument(
		config.databaseId!,
		config.databaseFriends!,
		friendListId,
		{
			friends_ids: [...current.friends_ids, friendId],
		}
	);

	return updated;
}

export async function getMyFriends() {
	const me = await account.get();

	const res = await databases.listDocuments(
		config.databaseId!,
		config.databaseFriends!,
		[Query.equal("user_id", me.$id)]
	);
	const friendsIds = res.documents[0].friends_ids;

	try {
		const friends = await databases.listDocuments(
			config.databaseId!,
			config.databaseUser!,
			[Query.equal("$id", friendsIds)]
		);
		return friends;
	} catch (e) {
		console.log(e);
	}
}

// MULTI STEP PICKER

export async function createSession(ownerId: string) {
	const session = await databases.createDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		"unique()",
		{ ownerId }
	);

	databases.updateDocument(
		config.databaseId!,
		config.databaseUser!,
		session.$id,
		{ multiStepPickerList: session.$id }
	);

	return session;
}

export async function getSessionsByUser() {
	const me = await getMyProfile();
	const myId = me.$id;

	return databases.listDocuments(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		[Query.equal("ownerId", myId)]
	);
}

export async function addItemToSession(tmdb_id: number) {
	return databases.createDocument(
		config.databaseId!,
		config.databaseMultiStepPickerItems!,
		"unique()",
		{ tmdb_id }
	);
}

export async function addItemsToSession(sessionId: string, tmdbIds: number[]) {
	const created = await Promise.all(tmdbIds.map((id) => addItemToSession(id)));
	const itemIds = created.map((doc) => doc.$id);

	return databases.updateDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId,
		{ multiStepPickerListItems: itemIds }
	);
}

export async function setItemScore(itemId: string, newScore: number) {
	return databases.updateDocument(
		config.databaseId!,
		config.databaseMultiStepPickerItems!,
		itemId,
		{ score: newScore }
	);
}
