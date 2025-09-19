import { CustomListsSection } from "@/components/CustomListsSection";
import { MovieSearch } from "@/components/movieSearch";
import { PopularMoviesGrid } from "@/components/popularMoviesGrid";
import PullToRefreshWrapper from "@/components/pullToRefreshWrapper";
import SetUserName from "@/components/setUserName";
import { WatchList } from "@/components/watchList";
import { useGlobalContext } from "@/lib/global-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const Index = () => {
	const { isLogged, loading } = useGlobalContext();
	const [refreshing, setRefreshing] = useState(false);
	if (loading) return null;

	if (!isLogged) return <Redirect href="/sign-in" />;

	const onRefresh = async () => {
		setRefreshing(true);
		await AsyncStorage.clear();
		setRefreshing(false);
	};

	return (
		<PullToRefreshWrapper onRefresh={onRefresh}>
			<View className="px-4 pt-2 pb-10 flex-1 bg-brand-bgc">
				<Pressable onPress={onRefresh}>
					<Text className="font-rubik-extrabold text-text text-2xl text-center my-4">
						CoWatch
					</Text>
				</Pressable>
				<MovieSearch />
				<SetUserName />
				<WatchList orientation="horizontal" />
				<CustomListsSection />
				<PopularMoviesGrid orientation="vertical" />
			</View>
		</PullToRefreshWrapper>
	);
};

export default Index;
