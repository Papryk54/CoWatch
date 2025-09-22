import { CheckCircle2 } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
type Friend = {
	$id: string;
	name: string;
	watchlist_main: string;
	friends: string;
};
const FriendStatusRow = ({
	friend,
}: {
	friend: Friend & { status?: string };
}) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (friend.status === "accepted") {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}).start();
		} else {
			fadeAnim.setValue(0);
		}
	}, [friend.status]);

	return (
		<View className="flex-row items-center bg-brand-accent/60 rounded-xl px-4 py-3">
			<Text className="text-text font-rubik-medium flex-1 text-lg">
				{friend.name}
			</Text>
			{friend.status === "pending" && (
				<View className="flex-row items-center">
					<ActivityIndicator size="small" color="#fbbf24" />
					<Text className="text-yellow-400 ml-2">Oczekiwanie...</Text>
				</View>
			)}
			{friend.status === "accepted" && (
				<Animated.View style={{ opacity: fadeAnim, marginLeft: 8 }}>
					<CheckCircle2 color="#22c55e" size={28} />
				</Animated.View>
			)}
		</View>
	);
};
export default FriendStatusRow;
