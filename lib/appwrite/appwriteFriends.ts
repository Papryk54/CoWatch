import { Query } from "react-native-appwrite";
import { account, config, databases, getMyProfile } from "../appwrite";

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
