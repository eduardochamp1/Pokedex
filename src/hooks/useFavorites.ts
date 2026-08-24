import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "f";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      try {
        setFavorites(JSON.parse(raw));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const toggle = useCallback((name: string) => {
    setFavorites((prev) => {
      const idx = prev.indexOf(name);
      const next = [...prev];
      if (idx >= 0) next.splice(idx, 1);
      else next.push(name);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggle };
}
