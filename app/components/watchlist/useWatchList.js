"use client";
import { useEffect, useState, useCallback } from "react";
const KEY = "watchlist.v1";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

export function useWatchlist() {
  const [items, setItems] = useState([]);
  useEffect(() => setItems(read()), []);
  const inWatchlist = useCallback((id) => items.some(m => m.id === id), [items]);
  const toggle = useCallback((movie) => {
    setItems(prev => {
      const exists = prev.some(m => m.id === movie.id);
      const next = exists ? prev.filter(m => m.id !== movie.id) : [{ id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date }, ...prev];
      write(next); return next;
    });
  }, []);
  return { items, inWatchlist, toggle };
}
