import {
	Account,
	Avatars,
	Client,
	Databases,
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
	databasePowerUps: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_POWER_UPS,
	tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY,
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

export async function login() {
	try {
		try {
			await account.get();
			return true;
		} catch (e) {
			console.log(e);
		}
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

		const friendList = await databases.createDocument(
			config.databaseId!,
			config.databaseFriends!,
			"unique()",
			{
				user_id: userId,
				friends_ids: [],
			}
		);

		const result = await databases.createDocument(
			config.databaseId!,
			config.databaseUser!,
			userId,
			{
				name: "New User",
				watchlist_main: defaultWL.$id,
				friends: friendList.$id,
			}
		);
		return result;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function updateUserName(newName: string) {
	try {
		const me = await account.get();
		const userCode = me.$id.slice(-4).toUpperCase();
		await databases.updateDocument(
			config.databaseId!,
			config.databaseUser!,
			me.$id,
			{
				name: newName,
				searchId: newName + "#" + userCode,
			}
		);
	} catch (e) {
		console.log(e);
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

export async function getMyProfile() {
	const me = await account.get();
	const res = await databases.listDocuments(
		config.databaseId!,
		config.databaseUser!,
		[Query.equal("$id", me.$id), Query.limit(1)]
	);
	return res.documents[0] ?? null;
}



// ELIMINATION PHASE


