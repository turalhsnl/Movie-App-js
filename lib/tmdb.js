const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(path, { query = {} } = {}) {
  const params = new URLSearchParams({ language: "en-US", ...query });
  const url = `${TMDB_BASE}${path}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("TMDB request failed");
  return res.json();
}

export const getPopular = (page=1) => tmdbFetch("/movie/popular", { query:{ page }});
export const searchMovies = (q, page=1) => tmdbFetch("/search/movie", { query:{ query:q, page, include_adult:"false" }});
export const getMovie = (id) => tmdbFetch(`/movie/${id}`, { query:{ append_to_response:"credits,videos,similar" }});
export const imageUrl = (path, size="w500") => path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.svg";