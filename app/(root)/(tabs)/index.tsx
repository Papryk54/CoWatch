import { CustomListsSection } from "@/components/CustomListsSection";
import Friends from "@/components/friends";
import { PopularMoviesGrid } from "@/components/popularMoviesGrid";
import { WatchList } from "@/components/watchList";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect } from "expo-router";
import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const Index = () => {
	const { isLogged, loading } = useGlobalContext();

	if (loading) return null;
	if (!isLogged) return <Redirect href="/sign-in" />;

	return (
		<ScrollView
			className="flex-1 bg-brand-bgc"
			contentContainerClassName="px-4 pt-2 pb-10"
			showsVerticalScrollIndicator={false}
		>
			<Text className="font-rubik-extrabold text-text text-2xl text-center">
				CoWatch
			</Text>

			<Friends></Friends>
			<View className="mt-3">
				<TextInput
					placeholder="Szukaj…"
					placeholderTextColor="#DDDDDD88"
					className="bg-brand-dark rounded-xl px-4 py-3 font-rubik text-text"
				/>
			</View>
			<WatchList orientation="horizontal"></WatchList>

			<CustomListsSection />

			<PopularMoviesGrid orientation="vertical" />
		</ScrollView>
	);
};

export default Index;
