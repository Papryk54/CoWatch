import Friends from "@/components/features/friends";
import PullToRefreshWrapper from "@/components/utils/pullToRefreshWrapper";
import WaitingForOthersButton from "@/components/utils/waitingForOthersButton";
import { client, config, getMyProfile } from "@/lib/appwrite";
import {
	getPowerUpStatus,
	getSessionsByUser,
	updateStatus,
} from "@/lib/appwrite/appwritePickerSession";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type UserRowProps = {
	user: {
		id: string;
		invite: boolean;
		firstPhase: boolean;
		secondPhase: boolean;
		thirdPhase: boolean;
		isOwner: boolean;
		isMe: boolean;
	};
	sessionId: string;
	sessionStep: number;
	thisUser: any;
	handleInvite: (sessionId: string, invite: boolean) => void;
};

const UserRow = ({
	user,
	sessionId,
	sessionStep,
	thisUser,
	handleInvite,
}: UserRowProps) => (
	<View>
		<Text className="text-text font-rubik-medium">{user.id}</Text>
		<Text className="text-text font-rubik-medium">
			{user.isOwner ? " (Właściciel)" : ""}
		</Text>
		{sessionStep === 0 && (
			<Text className="text-text font-rubik-medium">
				{user.invite ? "✅" : "❌"}
			</Text>
		)}
		{user.id === thisUser?.id && (
			<View>
				{!thisUser?.invite &&
					!thisUser?.firstPhase &&
					!thisUser?.secondPhase &&
					!thisUser?.thirdPhase && (
						<View className="flex-row justify-start mb-2">
							<Pressable
								className="bg-alerts-success px-4 py-1 rounded mr-2"
								onPress={() => handleInvite(sessionId, true)}
							>
								<Text className="text-white font-rubik-medium">Przyjmij</Text>
							</Pressable>
							<Pressable
								className="bg-alerts-error px-4 py-1 rounded"
								onPress={() => handleInvite(sessionId, false)}
							>
								<Text className="text-white font-rubik-medium">Odrzuć</Text>
							</Pressable>
						</View>
					)}
				{thisUser?.invite &&
					!thisUser?.firstPhase &&
					!thisUser?.secondPhase &&
					!thisUser?.thirdPhase && (
						<View className="flex-row justify-start mb-2">
							<Text className="text-text font-rubik-medium">CHUJ</Text>
						</View>
					)}
				{thisUser?.invite &&
					thisUser?.firstPhase &&
					!thisUser?.secondPhase &&
					!thisUser?.thirdPhase && (
						<View className="flex-row justify-start mb-2">
							<Text className="text-text font-rubik-medium">DUPA</Text>
						</View>
					)}
				{thisUser?.invite &&
					thisUser?.firstPhase &&
					thisUser?.secondPhase &&
					!thisUser?.thirdPhase && (
						<View className="flex-row justify-start mb-2">
							<Text className="text-text font-rubik-medium">CYCKI</Text>
						</View>
					)}
			</View>
		)}
	</View>
);

const Profile = () => {
	const [currentName, setCurrentName] = useState("");
	const [sessions, setSessions] = useState<any[]>([]);
	const [thisUser, setThisUser] = useState<any | null>(null);
	const [isAllInvited, setIsAllInvited] = useState(false);
	const [isAllFirstPhase, setIsAllFirstPhase] = useState(false);
	const [isAllSecondPhase, setIsAllSecondPhase] = useState(false);
	const [isAllThirdPhase, setIsAllThirdPhase] = useState(false);

	const load = async () => {
		try {
			const me = await getMyProfile();
			setCurrentName(me.name || "");
			const sessionsRes = await getSessionsByUser();
			const newSessions: any[] = [];
			for (let i = 0; i < sessionsRes?.documents.length; i++) {
				const sessionDoc = sessionsRes?.documents[i];
				const step = sessionDoc.step;
				const users: any[] = [];
				const ownerStatus = await getPowerUpStatus(sessionDoc.ownerId);
				users.push({
					id: sessionDoc.ownerId,
					invite: ownerStatus.invite,
					firstPhase: ownerStatus.first_phase,
					secondPhase: ownerStatus.second_phase,
					thirdPhase: ownerStatus.third_phase,
					isOwner: true,
					isMe: sessionDoc.ownerId === me.$id,
				});
				for (let j = 0; j < sessionDoc.guestsIds.length; j++) {
					const guestId = sessionDoc.guestsIds[j];
					const guestStatus = await getPowerUpStatus(guestId);
					users.push({
						id: guestId,
						invite: guestStatus.invite,
						firstPhase: guestStatus.first_phase,
						secondPhase: guestStatus.second_phase,
						thirdPhase: guestStatus.third_phase,
						isOwner: false,
						isMe: guestId === me.$id,
					});
				}
				newSessions.push({
					id: sessionDoc.$id,
					step: step,
					ownerId: sessionDoc.ownerId,
					guestsIds: sessionDoc.guestsIds,
					users,
				});
			}
			await setSessions(newSessions);
			const meFinal = newSessions
				.flatMap((s) => s.users)
				.find((u: any) => u.isMe);
			setThisUser(meFinal);

			const isAllInvited = newSessions
				.flatMap((s) => s.users)
				.every((u) => u.invite);
			const isAllFirstPhase = newSessions
				.flatMap((s) => s.users)
				.every((u) => u.firstPhase);
			const isAllSecondPhase = newSessions
				.flatMap((s) => s.users)
				.every((u) => u.secondPhase);
			const isAllThirdPhase = newSessions
				.flatMap((s) => s.users)
				.every((u) => u.thirdPhase);

			setIsAllInvited(isAllInvited);
			setIsAllFirstPhase(isAllFirstPhase);
			setIsAllSecondPhase(isAllSecondPhase);
			setIsAllThirdPhase(isAllThirdPhase);
		} catch (e) {
			console.log(e);
		}
	};

	const handleStartSession = async () => {
		router.push("/(root)/(flow)/sessionConfig");
	};

	const goToSession = (sessionId: string) => {
		router.push(`/(root)/(flow)/multiStepPicker/${sessionId}`);
	};

	const handleInvite = (sessionId: string, answer: boolean) => {
		if (answer) {
			updateStatus(sessionId, "invite");
		} else {
			console.log("rejected");
		}
	};

	useEffect(() => {
		const channel = `databases.${config.databaseId}.collections.${config.databasePowerUps}.documents`;

		const unsubscribe = client.subscribe(channel, async (response) => {
			const eventType = response.events[0];
			console.log("Received event: ", eventType);
			if (eventType.includes("update")) {
				load();
			}
		});
		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		load();
	}, []);

	return (
		<View className="w-full flex-1 bg-brand-bgc">
			<Pressable className="absolute top-6 right-6">
				<Text className="text-text font-rubik-medium text-2xl">⚙️</Text>
			</Pressable>
			<PullToRefreshWrapper onRefresh={load}>
				<Text className="text-text text-2xl font-bold my-6 text-center">
					{currentName}
				</Text>

				<View className="flex-1 bg-brand-bgc p-6">
					<View className="mb-8">
						<Pressable
							className={`w-44 items-center justify-center h-12 mt-4 rounded-xl bg-brand`}
							onPress={handleStartSession}
						>
							<Text className="text-text font-rubik-bold">
								Rozpocznij sesję
							</Text>
						</Pressable>
					</View>
					<View className="bg-brand-dark rounded-xl p-4">
						<Text className="text-text font-rubik-medium mb-3">
							Moje rozpoczęte sesje
						</Text>
						{sessions.length === 0 ? (
							<Text className="text-text/80 mb-3">Brak rozpoczętych sesji</Text>
						) : (
							<FlatList
								data={sessions}
								keyExtractor={(s) => s.id}
								renderItem={({ item }) => (
									<View className="bg-white/5 rounded-lg px-3 py-2 mb-2">
										<Text className="text-text font-rubik-medium">
											{"Sesja użytkownika - " + item.ownerId}
										</Text>
										<Text className="text-text font-rubik-medium">
											{`Etap ${item.step}`}
										</Text>
										<Text className="text-text font-rubik-bold">
											Uczestnicy:
										</Text>
										<FlatList
											data={item.users}
											keyExtractor={(user) => user.id}
											renderItem={({ item: user }) => (
												<UserRow
													user={user}
													sessionId={item.id}
													sessionStep={item.step}
													thisUser={thisUser}
													handleInvite={handleInvite}
												/>
											)}
											nestedScrollEnabled
										/>
										<View>
											{item.step === 0 && !isAllInvited && thisUser.invite && (
												<WaitingForOthersButton></WaitingForOthersButton>
											)}

											{item.step === 0 && !thisUser.invite && (
												<Pressable
													onPress={() => goToSession(item.id)}
													className="bg-brand px-4 py-1 rounded"
												>
													<Text className="text-white font-rubik-medium">
														Wznów
													</Text>
												</Pressable>
											)}

											{item.step === 1 &&
												!isAllFirstPhase &&
												thisUser.firstPhase && (
													<WaitingForOthersButton></WaitingForOthersButton>
												)}

											{item.step === 1 && !thisUser.firstPhase && (
												<Pressable
													onPress={() => goToSession(item.id)}
													className="bg-brand px-4 py-1 rounded"
												>
													<Text className="text-white font-rubik-medium">
														Wznów
													</Text>
												</Pressable>
											)}

											{item.step === 2 &&
												!isAllSecondPhase &&
												thisUser.secondPhase && (
													<WaitingForOthersButton></WaitingForOthersButton>
												)}

											{item.step === 2 && !thisUser.secondPhase && (
												<Pressable
													onPress={() => goToSession(item.id)}
													className="bg-brand px-4 py-1 rounded"
												>
													<Text className="text-white font-rubik-medium">
														Wznów
													</Text>
												</Pressable>
											)}

											{item.step === 3 &&
												!isAllThirdPhase &&
												thisUser.thirdPhase && (
													<WaitingForOthersButton></WaitingForOthersButton>
												)}

											{item.step === 3 && !thisUser.thirdPhase && (
												<Pressable
													onPress={() => goToSession(item.id)}
													className="bg-brand px-4 py-1 rounded"
												>
													<Text className="text-white font-rubik-medium">
														Wznów
													</Text>
												</Pressable>
											)}
										</View>
									</View>
								)}
							/>
						)}
					</View>
					<Friends></Friends>
				</View>
			</PullToRefreshWrapper>
		</View>
	);
};

export default Profile;
