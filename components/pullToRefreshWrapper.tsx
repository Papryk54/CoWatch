import React, { useState } from "react";
import { FlatList, RefreshControl } from "react-native";

type Props = {
	onRefresh: () => Promise<void> | void;
	children: React.ReactNode;
};

const PullToRefreshWrapper: React.FC<Props> = ({ onRefresh, children }) => {
	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		await onRefresh();
		setRefreshing(false);
	};

	return (
		<FlatList
			data={[null]}
			keyExtractor={() => "pull-to-refresh-wrapper"}
			renderItem={() => <>{children}</>}
			className="flex-1 bg-brand-bgc"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					colors={["#4282E8", "#7E3FD5"]}
					progressBackgroundColor="#141C2E"
				/>
			}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export default PullToRefreshWrapper;
