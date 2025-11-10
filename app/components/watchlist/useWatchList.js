"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "watchlist.v1";

const WatchlistContext = createContext(null);

const toTitle = movie => {
  const candidates = [movie?.title, movie?.name, movie?.original_title, movie?.original_name];
  return candidates.find(value => typeof value === "string" && value.trim().length > 0)?.trim() || "Untitled";
};

const normaliseMovie = movie => {
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

const parseStoredList = rawValue => {
  try {
    const parsed = typeof rawValue === "string" ? JSON.parse(rawValue || "[]") : rawValue;
    if (!Array.isArray(parsed)) return [];
    const unique = [];
    for (const candidate of parsed) {
      const normalised = normaliseMovie(candidate);
      if (!normalised) continue;
      if (!unique.some(item => item.id === normalised.id)) {
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

const write = value => {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isPersistent, setIsPersistent] = useState(true);

  useEffect(() => {
    const { list, persistent } = read();
    setItems(list);
    setIsPersistent(persistent);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isPersistent) {
      return undefined;
    }

    const handleStorage = event => {
      if (event.key === STORAGE_KEY) {
        setItems(parseStoredList(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isPersistent]);

  const updateItems = useCallback(updater => {
    setItems(previous => {
      const next = updater(previous);
      if (!Array.isArray(next)) {
        return previous;
      }

      const changed =
        next.length !== previous.length ||
        next.some((item, index) => item.id !== previous[index]?.id);

      if (!changed) {
        return previous;
      }

      const success = write(next);
      if (!success) {
        setIsPersistent(false);
      }

      return next;
    });
  }, []);

  const add = useCallback(
    movie => {
      updateItems(previous => {
        const normalised = normaliseMovie(movie);
        if (!normalised) {
          return previous;
        }
        if (previous.some(item => item.id === normalised.id)) {
          return previous;
        }
        return [normalised, ...previous];
      });
    },
    [updateItems],
  );

  const remove = useCallback(
    movie => {
      updateItems(previous => previous.filter(item => item.id !== movie?.id));
    },
    [updateItems],
  );

  const toggle = useCallback(
    movie => {
      updateItems(previous => {
        const id = movie?.id;
        if (id === null || id === undefined) {
          return previous;
        }

        if (previous.some(item => item.id === id)) {
          return previous.filter(item => item.id !== id);
        }

        const normalised = normaliseMovie(movie);
        if (!normalised) {
          return previous;
        }

        return [normalised, ...previous];
      });
    },
    [updateItems],
  );

  const inWatchlist = useCallback(id => items.some(movie => movie.id === id), [items]);

  const value = useMemo(
    () => ({ items, inWatchlist, toggle, add, remove, canPersist: isPersistent }),
    [items, inWatchlist, toggle, add, remove, isPersistent],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
