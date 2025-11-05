"use client";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
const KEY = "ratings.v1";
const getAll = () => { try { return JSON.parse(localStorage.getItem(KEY)||"{}"); } catch { return {}; } };
const setAll = (o) => localStorage.setItem(KEY, JSON.stringify(o));

export default function RatingStars({ movieId, compact }) {
  const [rating, setRating] = useState(0);
  useEffect(() => { setRating(getAll()[movieId] || 0); }, [movieId]);
  const set = (v) => { setRating(v); const all = getAll(); all[movieId] = v; setAll(all); };
  const size = compact ? 14 : 20;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => set(i)} aria-label={`Rate ${i} star`} className="hover:scale-110 transition">
          <FaStar size={size} className={i <= rating ? "text-yellow-400" : "text-neutral-600"} />
        </button>
      ))}
      {!compact && rating > 0 && <button onClick={() => set(0)} className="text-xs opacity-70 hover:opacity-100 ml-2 underline">clear</button>}
    </div>
  );
}
