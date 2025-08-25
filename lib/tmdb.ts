const API_URL = "https://api.themoviedb.org/3";
const KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

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

// const options = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmY5NWU0OGJlYzUzNTAxMzZjNjQyZGE1MzI0MjYyZSIsIm5iZiI6MTc1NDc3MjY0NC41NjYwMDAyLCJzdWIiOiI2ODk3YjRhNGQxMDI5MTEzZTY1ZDBiMjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2XggLP7T130GiqSx1ar7rtdxxcGaDbBrzi7eSrozeMY'
//   }
// };

// fetch('https://api.themoviedb.org/3/authentication', options)
//   .then(res => res.json())
//   .then(res => console.log(res))
//   .catch(err => console.error(err));
