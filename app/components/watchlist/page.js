"use client";
import Image from "next/image";
import Link from "next/link";
import { useWatchlist } from "@/components/watchlist/useWatchlist";
import { imageUrl } from "@/lib/tmdb";

export default function WatchlistPage() {
  const { items, toggle } = useWatchlist();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Your Watchlist</h1>
      {items.length===0 ? (
        <p className="opacity-80">Your watchlist is empty. Browse <Link href="/" className="underline">popular movies</Link> to add some!</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(m => (
            <li key={m.id} className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40">
              <Link href={`/movie/${m.id}`} className="block relative aspect-[2/3]">
                <Image src={imageUrl(m.poster_path, "w342")} alt={m.title} fill className="object-cover" />
              </Link>
              <div className="p-3">
                <div className="font-semibold line-clamp-2">{m.title}</div>
                <button onClick={() => toggle(m)} className="mt-2 text-sm underline opacity-80 hover:opacity-100">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
