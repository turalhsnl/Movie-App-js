import { searchMovies } from "@/lib/tmdb";
import MovieCard from "../movie/MovieCard";

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  const data = q.trim() ? await searchMovies(q, 1) : { results: [] };
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>
      {q ? (
        <>
          <p className="opacity-75">
            Results for &ldquo;<b>{q}</b>&rdquo;
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(data.results || []).map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </>
      ) : <p className="opacity-75">Start typing to search…</p>}
    </section>
  );
}