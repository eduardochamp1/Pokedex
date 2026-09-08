import { useQueries } from "@tanstack/react-query";
import { fetchJsonPublic } from "../api";
import type { AbilityDetail, PokemonAbility } from "../types/pokemon";

const HOUR = 60 * 60 * 1000;

export interface ResolvedAbility {
  slug: string;
  isHidden: boolean;
  detail: AbilityDetail | null;
}

/**
 * Busca a descricao de cada habilidade do pokemon.
 *
 * Sao 1 a 3 requests por pokemon, cacheados por uma hora e compartilhados
 * entre pokemons que tem a mesma habilidade (a queryKey e o slug).
 */
export function useAbilities(abilities: PokemonAbility[]): {
  resolved: ResolvedAbility[];
  isLoading: boolean;
} {
  const queries = useQueries({
    queries: abilities.map((a) => ({
      queryKey: ["ability", a.ability.name],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        fetchJsonPublic<AbilityDetail>(a.ability.url, signal),
      staleTime: HOUR,
      gcTime: HOUR,
    })),
  });

  return {
    resolved: abilities.map((a, i) => ({
      slug: a.ability.name,
      isHidden: a.is_hidden,
      detail: queries[i]?.data ?? null,
    })),
    isLoading: queries.some((q) => q.isLoading),
  };
}
