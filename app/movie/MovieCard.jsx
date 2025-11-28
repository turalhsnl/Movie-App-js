"use client";

import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/tmdb";
import { FaBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import { useWatchlist } from "../components/watchlist/useWatchList";
import RatingStars from "../components/ratings/RatingStars";
import { useLikes } from "../components/likes/useLikes";

export default function MovieCard({ movie }) {
  const { inWatchlist, toggle } = useWatchlist();
  const { inLikes, toggle: toggleLike } = useLikes();
  const saved = inWatchlist(movie.id);
  const liked = inLikes(movie.id);

  return (
    <div className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition">
      <Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3]">
        <Image
          src={imageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width:768px)50vw,25vw"
        />
      </Link>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">{movie.title}</h3>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle liked movie"
              onClick={() => toggleLike(movie)}
              className={
                "p-2 rounded-full " +
                (liked ? "text-pink-500" : "text-neutral-400 hover:text-pink-400")
              }
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
            </button>

            <button
              aria-label="Toggle watchlist"
              onClick={() => toggle(movie)}
              className={
                "p-2 rounded-full " +
                (saved ? "text-emerald-400" : "text-neutral-400 hover:text-emerald-300")
              }
            >
              <FaBookmark />
            </button>
          </div>
        </div>

        <div className="text-sm opacity-75">
          {new Date(movie.release_date || "").getFullYear() || "—"}
        </div>

        <RatingStars movieId={movie.id} compact />
      </div>
    </div>
  );
}
