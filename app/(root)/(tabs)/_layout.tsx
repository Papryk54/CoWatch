import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function Layout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarLabelStyle: { fontSize: 12 },
				tabBarStyle: {
					position: "absolute",
					height: 64,
					borderTopWidth: 0,
					elevation: 10,
					backgroundColor: "#0A0F1C",
					paddingBottom: 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: "#FFFFFF",
				tabBarInactiveTintColor: "#9AA3B2",
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="watchList"
				options={{
					title: "",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="list-outline" size={size} color={color} />
					),
				}}
			/>
      <Tabs.Screen
				name="profile"
				options={{
					title: "",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
