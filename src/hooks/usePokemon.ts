import { useCallback, useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchJsonPublic,
  getGeneration,
  getPokemonData,
  getPokemonIndex,
  getPokemons,
  getPokemonsByType,
  resolveName,
  searchPokemon,
} from "../api";
import {
  buildNameIndex,
  intersectNames,
  pageOf,
  searchNames,
  sortNamesById,
  totalPagesOf,
} from "../lib/filters";
import { RARITIES, type RarityId } from "../data/rarity";
import { evolutionConditionText } from "../lib/evolution";
import type {
  EvolutionChain,
  EvolutionNode,
  Pokemon,
  PokemonSpecies,
} from "../types/pokemon";

export const GENERATIONS = [
  { id: 1, label: "I — Kanto" },
  { id: 2, label: "II — Johto" },
  { id: 3, label: "III — Hoenn" },
  { id: 4, label: "IV — Sinnoh" },
  { id: 5, label: "V — Unova" },
  { id: 6, label: "VI — Kalos" },
  { id: 7, label: "VII — Alola" },
  { id: 8, label: "VIII — Galar" },
  { id: 9, label: "IX — Paldea" },
] as const;

export const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export const ITEMS_PER_PAGE = 25;

const HOUR = 60 * 60 * 1000;

interface PagedResult {
  pokemons: Pokemon[];
  totalPages: number;
}

/** Indice completo nome -> id. Um request, cacheado por uma hora. */
export function usePokemonIndex() {
  const query = useQuery({
    queryKey: ["pokemon-index"],
    queryFn: async ({ signal }) => buildNameIndex((await getPokemonIndex(signal)).results),
    staleTime: HOUR,
    gcTime: HOUR,
  });
  const index = query.data;

  /**
   * Id da Pokedex para um nome curado. Passa por resolveName porque a lore usa
   * nomes amigaveis ("giratina", "deoxys") e o indice guarda o slug da API
   * ("giratina-altered", "deoxys-normal") — sem isso o chip fica sem sprite.
   */
  const idOf = useCallback(
    (name: string) => index?.get(resolveName(name)),
    [index]
  );

  return {
    index,
    idOf,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function usePokemonList(page: number) {
  return useQuery<PagedResult>({
    queryKey: ["pokemon-list", page],
    queryFn: async ({ signal }) => {
      const data = await getPokemons(ITEMS_PER_PAGE, ITEMS_PER_PAGE * page, signal);
      const results = await Promise.all(
        data.results.map((p) => getPokemonData(p.url, signal))
      );
      return {
        pokemons: results.filter((r): r is Pokemon => r !== null),
        totalPages: totalPagesOf(data.count, ITEMS_PER_PAGE),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePokemonDetail(nameOrId: string | undefined) {
  return useQuery<Pokemon | null>({
    queryKey: ["pokemon-detail", nameOrId ? resolveName(nameOrId) : undefined],
    queryFn: ({ signal }) => searchPokemon(nameOrId!, signal),
    enabled: Boolean(nameOrId),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Nomes de um tipo — lista COMPLETA (um request), nao truncada.
 * A paginacao acontece depois, em usePokemonPage.
 */
function useTypeNames(typeName: string | undefined) {
  return useQuery<string[]>({
    queryKey: ["type-names", typeName?.toLowerCase()],
    queryFn: async ({ signal }) => {
      const data = await getPokemonsByType(typeName!, signal);
      if (!data) return [];
      return data.pokemon.map((p) => resolveName(p.pokemon.name));
    },
    enabled: Boolean(typeName),
    staleTime: HOUR,
  });
}

/** Nomes de uma geracao — lista COMPLETA de especies (um request). */
function useGenerationNames(gen: number | undefined) {
  return useQuery<string[]>({
    queryKey: ["generation-names", gen],
    queryFn: async ({ signal }) => {
      const data = await getGeneration(gen!, signal);
      if (!data) return [];
      return data.pokemon_species.map((s) => resolveName(s.name));
    },
    enabled: Boolean(gen),
    staleTime: HOUR,
  });
}

export interface SelectionCriteria {
  search?: string;
  type?: string;
  generation?: number;
  rarity?: RarityId;
}

export interface Selection {
  /** null = nenhum filtro ativo: a Home deve usar a listagem paginada padrao. */
  names: string[] | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Resolve busca + filtros para uma lista de nomes normalizados e ordenada por
 * id. Cada criterio custa no maximo um request; a interseccao e local.
 */
export function usePokemonSelection(criteria: SelectionCriteria): Selection {
  const { search, type, generation, rarity } = criteria;
  const { index, isLoading: indexLoading, isError: indexError } = usePokemonIndex();
  const typeQuery = useTypeNames(type);
  const genQuery = useGenerationNames(generation);

  const rarityNames = useMemo(() => {
    if (!rarity) return undefined;
    return RARITIES.find((r) => r.id === rarity)?.names.map(resolveName) ?? [];
  }, [rarity]);

  const searchQuery = search?.trim() ? search.trim() : undefined;
  const hasCriteria = Boolean(searchQuery || type || generation || rarity);

  const names = useMemo(() => {
    if (!hasCriteria || !index) return null;

    const sources: string[][] = [];
    if (searchQuery) sources.push(searchNames(searchQuery, index));
    if (type) sources.push(typeQuery.data ?? []);
    if (generation) sources.push(genQuery.data ?? []);
    if (rarityNames) sources.push(rarityNames);

    return sortNamesById(intersectNames(sources), index);
  }, [
    hasCriteria,
    index,
    searchQuery,
    type,
    generation,
    rarityNames,
    typeQuery.data,
    genQuery.data,
  ]);

  return {
    names,
    isLoading:
      hasCriteria &&
      (indexLoading ||
        (Boolean(type) && typeQuery.isLoading) ||
        (Boolean(generation) && genQuery.isLoading)),
    isError: indexError || typeQuery.isError || genQuery.isError,
  };
}

/**
 * Busca os detalhes apenas da pagina visivel de uma selecao (25 requests por
 * pagina, em vez de tudo de uma vez).
 */
export function usePokemonPage(names: string[] | null, page: number) {
  const slice = useMemo(
    () => (names ? pageOf(names, page, ITEMS_PER_PAGE) : []),
    [names, page]
  );
  const { pokemons, isLoading, isError } = usePokemonsByNames(slice);
  return {
    pokemons,
    isLoading,
    isError,
    totalPages: names ? totalPagesOf(names.length, ITEMS_PER_PAGE) : 1,
    total: names?.length ?? 0,
  };
}

export function usePokemonsByNames(names: string[]) {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-detail", resolveName(name)],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        searchPokemon(name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });
  return {
    pokemons: queries
      .map((q) => q.data)
      .filter((p): p is Pokemon => Boolean(p)),
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}

export function usePokemonSpecies(speciesUrl: string | undefined) {
  return useQuery<PokemonSpecies | null>({
    queryKey: ["pokemon-species", speciesUrl],
    queryFn: ({ signal }) =>
      fetchJsonPublic<PokemonSpecies>(speciesUrl!, signal),
    enabled: Boolean(speciesUrl),
    staleTime: HOUR,
  });
}

export interface EvolutionStep {
  name: string;
  /** Condicao para chegar NESTE estagio; vazio no primeiro. */
  condition: string;
}

function flattenEvolutionChain(
  node: EvolutionNode,
  condition = ""
): EvolutionStep[] {
  const steps: EvolutionStep[] = [{ name: node.species.name, condition }];
  for (const child of node.evolves_to) {
    steps.push(
      ...flattenEvolutionChain(
        child,
        evolutionConditionText(child.evolution_details?.[0])
      )
    );
  }
  return steps;
}

export function useEvolutionChain(speciesUrl: string | undefined) {
  return useQuery<EvolutionStep[]>({
    queryKey: ["evolution-chain", speciesUrl],
    queryFn: async ({ signal }) => {
      if (!speciesUrl) return [];
      const species = await fetchJsonPublic<PokemonSpecies>(speciesUrl, signal);
      if (!species) return [];
      const chain = await fetchJsonPublic<EvolutionChain>(
        species.evolution_chain.url,
        signal
      );
      if (!chain) return [];
      return flattenEvolutionChain(chain.chain);
    },
    enabled: Boolean(speciesUrl),
    staleTime: HOUR,
  });
}

export function useFavoritePokemons(names: string[]) {
  return usePokemonsByNames(names);
}
