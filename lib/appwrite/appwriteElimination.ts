import { config, databases } from "../appwrite";
import { getSession } from "./appwritePickerSession";

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
    const session = await getSession(sessionId);
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

export async function nextUserTurn(sessionId: string) {
  const session = await getSession(sessionId);
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
