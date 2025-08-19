import axios from 'axios';
export const searchMovies = async (req, res) => {
  const { query } = req.query;
  const tmdb = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
    params: { api_key: process.env.TMDB_API_KEY, query }
  });
  res.json(tmdb.data.results);
};
