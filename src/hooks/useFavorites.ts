import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "pokedex:favorites";
const LEGACY_KEY = "f";

/** Le e sanitiza a lista guardada, tolerando storage indisponivel ou corrompido. */
function readStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      window.localStorage.getItem(FAVORITES_KEY) ??
      window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function useFavorites() {
  // Inicializador lazy: evita o flash de "Favoritos (0)" no primeiro paint.
  const [favorites, setFavorites] = useState<string[]>(readStored);

  // Persistir num effect mantem o updater do setState puro.
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage cheio ou bloqueado (aba privada): favoritos ficam so na sessao.
    }
  }, [favorites]);

  const toggle = useCallback((name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  return { favorites, toggle };
}
