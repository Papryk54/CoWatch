import { MovieSearchBar } from "@/components/features/movieSearchBar";
import SetUserName from "@/components/features/setUserName";
import AllWatchlistDisplayHome from "@/components/layout/allWatchlistDisplayHome";
import PullToRefreshWrapper from "@/components/utils/pullToRefreshWrapper";
import { useGlobalContext } from "@/lib/global-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Index = () => {
	const { isLogged, loading } = useGlobalContext();
	if (loading) return null;

	if (!isLogged) return <Redirect href="/sign-in" />;

	const onRefresh = async () => {
		await AsyncStorage.clear();
	};

	return (
		<PullToRefreshWrapper onRefresh={onRefresh}>
			<View className="px-4 pt-2 pb-10 flex-1 bg-brand-bgc">
				<Pressable onPress={onRefresh}>
					<Text className="font-rubik-extrabold text-text text-2xl text-center my-2">
						CoWatch
					</Text>
				</Pressable>
				<MovieSearchBar />
				<SetUserName />
				<View className="-mx-4">
					<AllWatchlistDisplayHome />
				</View>
			</View>
		</PullToRefreshWrapper>
	);
};

export default Index;
