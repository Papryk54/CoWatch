import React, { useState } from "react";
import { Text, View } from "react-native";
import { MovieGrid } from "./movieGrid";
import { Movie } from "./movieTile";

type CustomList = { id: string; title: string; data: Movie[] };

const mockMovies = [
	{
		id: 1,
		title: "Kredyt Hipoteczny",
		vote_average: 8.5,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster1.png"),
	},
	{
		id: 2,
		title: "Kawaii Apocalypse",
		vote_average: 7.5,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster2.png"),
	},
	{
		id: 3,
		title: "Alien vs Predator vs Pani z Żabki",
		vote_average: 9.0,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster3.png"),
	},
	{
		id: 4,
		title: "Zombie Disco",
		vote_average: 4.0,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster4.png"),
	},
	{
		id: 5,
		title: "Lody zemsty",
		vote_average: 2.5,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster5.png"),
	},
	{
		id: 6,
		title: "Krecik vs Godzilla",
		vote_average: 8.0,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster6.png"),
	},
	{
		id: 7,
		title: "Perfect Waifu",
		vote_average: 7.0,
		poster_path: null,
		localPoster: require("../assets/images/posters/moviePoster7.png"),
	},
];

const defaultLists: CustomList[] = [
	{
		id: "l1",
		title: "Anime",
		data: [mockMovies[1], mockMovies[6]],
	},
	{
		id: "l2",
		title: "Ania i Jarek",
		data: [mockMovies[0], mockMovies[2], mockMovies[4]],
	},
	{
		id: "l3",
		title: "Horrory",
		data: [mockMovies[0], mockMovies[2], mockMovies[3], mockMovies[4]],
	},
];
export function CustomListsSection({ lists }: { lists?: CustomList[] }) {
	const shown = (lists ?? defaultLists).slice(0, 3);

	return (
		<View>
			{shown.map((list) => (
				<View key={list.id} className="mb-6">
					<Text className="font-rubik-semibold text-text text-xl mb-2">
						{list.title}
					</Text>
					<MovieGrid
						data={list.data}
						loading={false}
						orientation="horizontal"
						imagePlaceholder
					/>
				</View>
			))}
		</View>
	);
}
