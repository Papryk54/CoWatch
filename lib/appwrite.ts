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

// USERS

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

// WATCHLIST

export async function getMyWatchlists() {
	const me = await account.get();

	return databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlist!,
		[Query.equal("user_id", me.$id)]
	);
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
	return databases.listDocuments(
		config.databaseId!,
		config.databaseWatchlistItems!,
		[Query.equal("watchList_id", watchList_id)]
	);
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

// FRIENDS

export async function findProfileById(searchId: string) {
	try {
		const res = await databases.listDocuments(
			config.databaseId!,
			config.databaseUser!,
			[Query.equal("searchId", searchId), Query.limit(1)]
		);
		return res.documents[0];
	} catch {}
}

export async function addUserToFriends(friendId: string) {
	const me = await getMyProfile();
	const friendListId = me.friends.$id;

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
			[Query.equal("searchId", friendsIds)]
		);
		return friends;
	} catch (e) {
		console.log(e);
	}
}

// MULTI STEP PICKER

export async function createSession(ownerId: string, guestsIds: string[]) {
	try {
		const allUsers = [ownerId, ...guestsIds];
		const powerUps = await Promise.all(
			allUsers.map((user_id) => {
				if (user_id !== ownerId) {
					return databases.createDocument(
						config.databaseId!,
						config.databasePowerUps!,
						"unique()",
						{ user_id }
					);
				} else {
					return databases.createDocument(
						config.databaseId!,
						config.databasePowerUps!,
						"unique()",
						{ user_id, invite: true }
					);
				}
			})
		);
		const session = await databases.createDocument(
			config.databaseId!,
			config.databaseMultiStepPicker!,
			"unique()",
			{
				ownerId,
				guestsIds,
				step: 0,
				powerUps: powerUps.map((p) => p.$id),
				allUsersInSession: [ownerId, ...guestsIds],
				currentUserId: ownerId,
			}
		);
		return session;
	} catch (e) {
		console.log(e);
	}
}

export async function updatePowerUp(
	userId: string,
	sessionId: string,
	powerUpType: "fav" | "skull" | "reset"
) {
	const res = await databases.listDocuments(
		config.databaseId!,
		config.databasePowerUps!,
		[Query.equal("user_id", userId)]
	);
	const powerUpDoc = res.documents[0];
	if (powerUpType === "fav") {
		const fav = powerUpDoc.fav;
		return await databases.updateDocument(
			config.databaseId!,
			config.databasePowerUps!,
			powerUpDoc.$id,
			{ fav: fav - 1 }
		);
	} else if (powerUpType === "skull") {
		const skull = powerUpDoc.skull;
		return await databases.updateDocument(
			config.databaseId!,
			config.databasePowerUps!,
			powerUpDoc.$id,
			{ skull: skull - 1 }
		);
	} else if (powerUpType === "reset") {
		return await databases.updateDocument(
			config.databaseId!,
			config.databasePowerUps!,
			powerUpDoc.$id,
			{ fav: 2, skull: 1 }
		);
	}
}

export async function updateStatus(
	sessionId: string,
	status: "invite" | "first_phase" | "second_phase" | "third_phase"
) {
	try {
		const session = await databases.getDocument(
			config.databaseId!,
			config.databaseMultiStepPicker!,
			sessionId
		);
		const me = await account.get();
		const myActions = session.powerUps.find((p: any) => p.user_id === me.$id);
		const otherUsersActions = session.powerUps.filter(
			(p: any) => p.user_id !== me.$id
		);
		const updated = await databases.updateDocument(
			config.databaseId!,
			config.databasePowerUps!,
			myActions.$id,
			{ [status]: true }
		);
		if (otherUsersActions.every((p: any) => p[status] === true)) {
			if (status === "first_phase") {
				await afterTinderElimination(sessionId);
			}
			if (status === "second_phase") {
				await afterGroupElimination(sessionId);
			}
			await databases.updateDocument(
				config.databaseId!,
				config.databaseMultiStepPicker!,
				sessionId,
				{ step: session.step + 1 }
			);
		}
		return updated;
	} catch (e) {
		console.log("ERROR occurs in updateStatus: ", e);
		return null;
	}
}

export async function getPowerUpStatus(userId: string) {
	const res = await databases.listDocuments(
		config.databaseId!,
		config.databasePowerUps!,
		[Query.equal("user_id", userId)]
	);
	const powerDoc = res.documents[0]; // TU JEST BŁĄD - NIE MA SPRAWDZENIA O KTÓRĄ SESHE CHODZI
	return {
		fav: powerDoc.fav,
		skull: powerDoc.skull,
		invite: powerDoc.invite,
		first_phase: powerDoc.first_phase,
		second_phase: powerDoc.second_phase,
		third_phase: powerDoc.third_phase,
	};
}

export async function getSessionStep(sessionId: string) {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
	return session.step;
}

export async function getSessionsByUser() {
	const me = await getMyProfile();
	const myId = me.$id;

	return databases.listDocuments(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		[
			Query.or([
				Query.equal("ownerId", myId),
				Query.contains("guestsIds", myId),
			]),
		]
	);
}

export async function getFriendsSessionsStatus() {}

export async function addItemToSession(tmdb_id: number) {
	return databases.createDocument(
		config.databaseId!,
		config.databaseMultiStepPickerItems!,
		"unique()",
		{ tmdb_id }
	);
}

export async function addItemsToSession(sessionId: string, tmdbIds: number[]) {
	try {
		let selectedIds = tmdbIds;
		if (tmdbIds.length > 100) {
			selectedIds = [];
			const used = new Set<number>();
			while (selectedIds.length < 100) {
				const idx = Math.floor(Math.random() * tmdbIds.length);
				if (!used.has(idx)) {
					used.add(idx);
					selectedIds.push(tmdbIds[idx]);
				}
			}
		}
		const created = await Promise.all(
			selectedIds.map((id) => addItemToSession(id))
		);
		const itemIds = created.map((doc) => doc.$id);

		return await databases.updateDocument(
			config.databaseId!,
			config.databaseMultiStepPicker!,
			sessionId,
			{ multiStepPickerListItems: itemIds }
		);
	} catch (e) {
		console.log("ERROR occurs in addItemsToSession: ", e);
		return null;
	}
}

export async function getSessionItems(sessionId: string) {
	const list = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
	return list.multiStepPickerListItems;
}

export async function getNumberOfUsersInSession(sessionId: string) {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
	return session.guestsIds.length + 1;
}

export async function getFriendsForGame(sessionId: string) {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
	const friendsIds = session.guestsIds;
	return databases.listDocuments(config.databaseId!, config.databaseUser!, [
		Query.equal("$id", friendsIds),
	]);
}

export async function setItemScore(itemId: string, newScore: number) {
	const doc = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPickerItems!,
		itemId
	);

	return databases.updateDocument(
		config.databaseId!,
		config.databaseMultiStepPickerItems!,
		itemId,
		{ score: doc.score + newScore }
	);
}

// ELIMINATING ITEMS

export async function afterTinderElimination(sessionId: string) {
	const items = await getSessionItems(sessionId);
	const itemsWithScores = await Promise.all(
		items.map(async (id: any) => {
			return await databases.getDocument(
				config.databaseId!,
				config.databaseMultiStepPickerItems!,
				id.$id
			);
		})
	);
	itemsWithScores.sort((a: any, b: any) => b.score - a.score);

	let toKeep: any[] = [];
	let toDelate: any[] = [];

	if (items.length >= 12 && items.length <= 15) {
		toKeep = itemsWithScores.slice(0, 8);
		toDelate = itemsWithScores.slice(8);
	} else if (items.length >= 16 && items.length <= 23) {
		toKeep = itemsWithScores.slice(0, 12);
		toDelate = itemsWithScores.slice(12);
	} else if (items.length >= 24 && items.length <= 30) {
		toKeep = itemsWithScores.slice(0, 16);
		toDelate = itemsWithScores.slice(16);
	} else if (items.length >= 31 && items.length <= 50) {
		toKeep = itemsWithScores.slice(0, 20);
		toDelate = itemsWithScores.slice(20);
	} else if (items.length > 50) {
		if (items.length === 100) {
			toKeep = itemsWithScores.slice(0, 40);
			toDelate = itemsWithScores.slice(40);
		} else {
			toKeep = itemsWithScores.slice(0, Math.floor(items.length / 10) * 4 + 4);
			toDelate = itemsWithScores.slice(Math.floor(items.length / 10) * 4 + 4);
		}
	} else {
		toKeep = itemsWithScores;
		toDelate = [];
	}

	const updatedSession = await databases.updateDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId,
		{ multiStepPickerListItems: toKeep.map((item: any) => item.$id) }
	);

	await Promise.all(
		toDelate.map(async (item: any) => {
			return await databases.deleteDocument(
				config.databaseId!,
				config.databaseMultiStepPickerItems!,
				item.$id
			);
		})
	);

	return updatedSession;
}

export async function afterGroupElimination(sessionId: string) {
	try {
		const items = await getSessionItems(sessionId);
		const itemsWithScores = await Promise.all(
			items.map(async (id: any) => {
				return await databases.getDocument(
					config.databaseId!,
					config.databaseMultiStepPickerItems!,
					id.$id
				);
			})
		);
		itemsWithScores.sort((a: any, b: any) => b.score - a.score);
		let toKeep;
		let toDelate;
		if (itemsWithScores.length < 12) {
			toKeep = itemsWithScores.slice(0, 6);
			toDelate = itemsWithScores.slice(6);
		} else {
			toKeep = itemsWithScores.slice(0, 10);
			toDelate = itemsWithScores.slice(10);
		}

		await databases.updateDocument(
			config.databaseId!,
			config.databaseMultiStepPicker!,
			sessionId,
			{ multiStepPickerListItems: toKeep.map((item: any) => item.$id) }
		);

		if (toDelate.length >= 0) {
			await Promise.all(
				toDelate.map(async (item: any) => {
					await databases.deleteDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						item.$id
					);
				})
			);
		}

		const finalItems = await getSessionItems(sessionId);
		finalItems.sort((a: any, b: any) => b.score - a.score);
		for (let i = 0; i < finalItems.length; i++) {
			if (finalItems.length === 6) {
				if (i <= 5 && i > 3) {
					// 4,5
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 1 }
					);
					continue;
				} else if (i <= 3 && i > 1) {
					// 2,3
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 2 }
					);
					continue;
				} else if (i <= 1 && i >= 0) {
					// 0,1
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 3 }
					);
				}
			}
			if (finalItems.length === 10) {
				if (i <= 9 && i > 6) {
					// 7,8,9
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 1 }
					);
					continue;
				} else if (i <= 5 && i > 3) {
					// 4,5,6
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 2 }
					);
					continue;
				} else if (i <= 3 && i >= 0) {
					// 0,1,2,3
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 3 }
					);
				}
			}
		}
		return true;
	} catch (e) {
		console.log("ERROR occurs in afterGroupElimination: ", e);
		return null;
	}
}

export async function attackItem(itemId: string, sessionId: string) {
	try {
		const item = await databases.getDocument(
			config.databaseId!,
			config.databaseMultiStepPickerItems!,
			itemId
		);
		await databases.updateDocument(
			config.databaseId!,
			config.databaseMultiStepPickerItems!,
			itemId,
			{ hearts: item.hearts - 1 }
		);
		await nextUserTurn(sessionId);
	} catch (e) {
		console.log("ERROR occurs in attackItem: ", e);
		return null;
	}
}

export async function getCurrentUserForElimination(sessionId: string) {
	try {
		const session = await databases.getDocument(
			config.databaseId!,
			config.databaseMultiStepPicker!,
			sessionId
		);
		const currentUserId = session.currentUserId;
		const currentUser = await databases.getDocument(
			config.databaseId!,
			config.databaseUser!,
			currentUserId
		);
		return currentUser.name;
	} catch (e) {
		console.log("ERROR occurs in getCurrentUserForElimination: ", e);
		return null;
	}
}

export async function getSessionUsers(sessionId: string) {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);

	const userIds = [session.allUsersInSession];
	return userIds;
}

export async function nextUserTurn(sessionId: string) {
	const session = await databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
	const allUsers = session.allUsersInSession;
	const currentUser = session.currentUserId;
	const currentIndex = allUsers.indexOf(currentUser);
	const nextIndex = (currentIndex + 1) % allUsers.length;
	const nextUserId = allUsers[nextIndex];

	return await databases.updateDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId,
		{ currentUserId: nextUserId }
	);
}

export async function deleteSession(sessionId: string) {
	return await databases.deleteDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
}
