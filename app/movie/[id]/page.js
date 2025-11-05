import Image from "next/image";
import Link from "next/link";
import { getMovie, imageUrl } from "@/lib/tmdb";
import MovieCard from "../../movie/MovieCard";
import RatingStars from "../../components/ratings/RatingStars";

export default async function MoviePage({ params: { id } }) {
  const movie = await getMovie(id);
  const poster = imageUrl(movie.poster_path, "w500");
  const backdrop = imageUrl(movie.backdrop_path, "w780");
  const trailer = movie.videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer");

  return (
    <article className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800">
        <Image src={backdrop} alt="" width={1280} height={720} className="w-full h-auto object-cover opacity-60" />
        <div className="absolute inset-0 p-6 flex items-end bg-gradient-to-t from-neutral-950/90 via-neutral-950/60 to-transparent">
          <div className="flex gap-6 items-end">
            <Image src={poster} alt={movie.title} width={240} height={360} className="rounded-xl border border-neutral-800" />
            <div>
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <div className="opacity-80">{(movie.release_date || "").slice(0,4)} • {movie.runtime}m • {movie.genres?.map(g => g.name).join(", ")}</div>
              <RatingStars movieId={movie.id} />
            </div>
          </div>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="opacity-90">{movie.overview || "No overview available."}</p>
          </div>

          {trailer && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Trailer</h2>
              <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-800">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="YouTube trailer"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Cast</h3>
            <ul className="space-y-1 text-sm opacity-95">
              {movie.credits?.cast?.slice(0, 12).map(c => (
                <li key={c.cast_id}>{c.name} <span className="opacity-60">as {c.character}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <a
              className="underline opacity-90 hover:opacity-100"
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank" rel="noreferrer"
            >
              View on TMDB
            </a>
          </div>
        </aside>
      </section>

      {movie.similar?.results?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movie.similar.results.slice(0,10).map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}
    </article>
  );
}
