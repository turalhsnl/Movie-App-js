import { getPopular } from "@/lib/tmdb";
import MovieCard from "./movie/MovieCard";

export default async function Home() {
  const data = await getPopular(1);
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Popular Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(data.results || []).map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
    </section>
  );
}