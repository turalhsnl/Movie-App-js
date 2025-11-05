"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "watchlist.v1";

const toTitle = (movie) => {
  const candidates = [movie?.title, movie?.name, movie?.original_title, movie?.original_name];
  return candidates.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() || "Untitled";
};

const normaliseMovie = (movie) => {
  if (!movie || (movie.id ?? null) === null || movie.id === undefined) {
    return null;
  }

  return {
    id: movie.id,
    title: toTitle(movie),
    poster_path: movie.poster_path ?? movie.backdrop_path ?? null,
    release_date: movie.release_date ?? movie.first_air_date ?? null,
  };
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const parseStoredList = (rawValue) => {
  try {
    const parsed = typeof rawValue === "string" ? JSON.parse(rawValue || "[]") : rawValue;
    if (!Array.isArray(parsed)) return [];
    const unique = [];
    for (const candidate of parsed) {
      const normalised = normaliseMovie(candidate);
      if (!normalised) continue;
      if (!unique.some((item) => item.id === normalised.id)) {
        unique.push(normalised);
      }
    }
    return unique;
  } catch {
    return [];
  }
};

const read = () => {
  const storage = getStorage();
  if (!storage) return { list: [], persistent: false };

  try {
    const list = parseStoredList(storage.getItem(STORAGE_KEY));
    return { list, persistent: true };
  } catch {
    return { list: [], persistent: false };
  }
};

const write = (value) => {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export function useWatchlist() {
  const [items, setItems] = useState([]);
  const [isPersistent, setIsPersistent] = useState(true);

  useEffect(() => {
    const { list, persistent } = read();
    setItems(list);
    setIsPersistent(persistent);

    if (!persistent) {
      return () => {};
    }

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setItems(parseStoredList(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const inWatchlist = useCallback(
    (id) => items.some((movie) => movie.id === id),
    [items],
  );

  const toggle = useCallback((movie) => {
    setItems((previous) => {
      const existing = previous.some((item) => item.id === movie?.id);

      if (existing) {
        const next = previous.filter((item) => item.id !== movie.id);
        write(next);
        return next;
      }

      const normalised = normaliseMovie(movie);
      if (!normalised) {
        return previous;
      }

      const next = [normalised, ...previous];
      write(next);
      return next;
    });
  }, []);

  return { items, inWatchlist, toggle, canPersist: isPersistent };
}
