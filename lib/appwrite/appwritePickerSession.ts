import { Query } from "react-native-appwrite";
import { account, config, databases, getMyProfile } from "../appwrite";
import { afterGroupElimination, afterTinderElimination } from "./appwriteTinderAndGroupPhase";

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

export async function getSession(sessionId: string) {
	return databases.getDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
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
		const session = await getSession(sessionId);
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
	const session = await getSession(sessionId);
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

export async function getFriendsForGame(sessionId: string) {
	const session = await getSession(sessionId);
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

export async function deleteSession(sessionId: string) {
	return await databases.deleteDocument(
		config.databaseId!,
		config.databaseMultiStepPicker!,
		sessionId
	);
}
