const API_URL = "https://api.themoviedb.org/3";
const KEY = process.env.EXPO_PUBLIC_TMDB_API_CODE;

const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${KEY}`,
	},
};

export async function fetchPopularMovies() {
	const res = await fetch(
		`${API_URL}/movie/popular?language=pl-PL&page=1`,
		options
	).then((res) => res.json());
	return res;
}
