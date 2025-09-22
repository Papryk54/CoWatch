import React from "react";
import { Image, Text, View } from "react-native";

interface ProgressBarProps {
	index: number;
	movies: any[];
	done?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ index, movies, done }) => {
	const current = movies.length === 0 ? 0 : Math.min(index + 1, movies.length);
	const total = movies.length;
	const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

	return (
		<View className="w-full h-24 pt-8 pb-2 px-6 absolute top-0 left-0">
			<View className="flex-row items-center justify-center">
				{done && (
					<Image
						source={require("../../assets/icons/like.png")}
						className="w-8 h-8"
					/>
				)}
				{!done && (
					<Text className="text-text font-rubik-bold text-lg mr-2 h-8">
						{current} / {total}
					</Text>
				)}
			</View>
			<View className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
				{done && (
					<View
						className="h-2 bg-alerts-success rounded-full"
						style={{ width: `${progress}%` }}
					/>
				)}
				{!done && (
					<View
						className="h-2 bg-brand-accent rounded-full"
						style={{ width: `${progress}%` }}
					/>
				)}
			</View>
		</View>
	);
};

export default ProgressBar;
