// TINDER PHASE

import { config, databases } from "../appwrite";
import { getSessionItems } from "./appwritePickerSession";

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

// GROUP PHASE

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
				if (i <= 5 && i > 2) {
					// 3,4,5
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 1 }
					);
					continue;
				} else if (i <= 2 && i > 0) {
					// 1,2
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 2 }
					);
					continue;
				} else if (i === 0) {
					// 0
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 3 }
					);
				}
			}
			if (finalItems.length === 10) {
				if (i <= 9 && i > 4) {
					// 5,6,7,8,9
					await databases.updateDocument(
						config.databaseId!,
						config.databaseMultiStepPickerItems!,
						finalItems[i].$id,
						{ hearts: 1 }
					);
					continue;
				} else if (i <= 4 && i > 1) {
					// 2,3,4
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
		}
		return true;
	} catch (e) {
		console.log("ERROR occurs in afterGroupElimination: ", e);
		return null;
	}
}
