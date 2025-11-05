"use client";

import Image from "next/image";
import Link from "next/link";

import { useWatchlist } from "@/components/watchlist/useWatchList";
import { imageUrl } from "@/lib/tmdb";

function WatchlistItem({ movie, onRemove }) {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return (
    <li className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40">
      <Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3]">
        <Image
          src={imageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
      </Link>
      <div className="p-3 space-y-2">
        <div className="font-semibold leading-snug line-clamp-2" title={movie.title}>
          {movie.title}
        </div>
        <div className="text-sm opacity-70">{releaseYear || "—"}</div>
        <button
          type="button"
          onClick={() => onRemove(movie)}
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          Remove from watchlist
        </button>
      </div>
    </li>
  );
}

function PersistenceNotice() {
  return (
    <p className="text-sm text-amber-400">
      We couldn&rsquo;t access your browser&rsquo;s storage. The watchlist will reset once you close this tab.
    </p>
  );
}

export default function WatchlistPage() {
  const { items, toggle, canPersist } = useWatchlist();

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Your Watchlist</h1>
          {!canPersist && <PersistenceNotice />}
        </div>
        <p className="opacity-80">
          Your watchlist is empty. Browse the
          {" "}
          <Link href="/" className="underline">
            latest popular movies
          </Link>
          {" "}
          and add the ones you want to watch later.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Your Watchlist</h1>
        {!canPersist && <PersistenceNotice />}
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map(movie => (
          <WatchlistItem key={movie.id} movie={movie} onRemove={toggle} />
        ))}
      </ul>
    </section>
  );
}
