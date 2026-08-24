import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchJsonPublic,
  getGeneration,
  getPokemonData,
  getPokemons,
  getPokemonsByType,
  searchPokemon,
} from "../api";
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

interface PagedResult {
  pokemons: Pokemon[];
  totalPages: number;
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
        totalPages: Math.ceil(data.count / ITEMS_PER_PAGE),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePokemonSearch(term: string | undefined) {
  return useQuery<Pokemon | null>({
    queryKey: ["pokemon-search", term?.toLowerCase().trim()],
    queryFn: ({ signal }) => searchPokemon(term!, signal),
    enabled: Boolean(term && term.trim()),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePokemonDetail(nameOrId: string | undefined) {
  return useQuery<Pokemon | null>({
    queryKey: ["pokemon-detail", nameOrId?.toLowerCase()],
    queryFn: ({ signal }) => searchPokemon(nameOrId!, signal),
    enabled: Boolean(nameOrId),
    staleTime: 30 * 60 * 1000,
  });
}

const MAX_PER_TYPE = 30;

export function usePokemonsByType(typeName: string | undefined) {
  return useQuery<Pokemon[]>({
    queryKey: ["pokemon-by-type", typeName?.toLowerCase()],
    queryFn: async ({ signal }) => {
      const data = await getPokemonsByType(typeName!, signal);
      if (!data) return [];
      const slice = data.pokemon.slice(0, MAX_PER_TYPE);
      const results = await Promise.all(
        slice.map((p) => getPokemonData(p.pokemon.url, signal))
      );
      return results.filter((r): r is Pokemon => r !== null);
    },
    enabled: Boolean(typeName),
    staleTime: 10 * 60 * 1000,
  });
}

const MAX_PER_GENERATION = 40;

export function usePokemonsByGeneration(gen: number | undefined) {
  return useQuery<Pokemon[]>({
    queryKey: ["pokemon-by-generation", gen],
    queryFn: async ({ signal }) => {
      if (!gen) return [];
      const data = await getGeneration(gen, signal);
      if (!data) return [];
      const sorted = [...data.pokemon_species].sort((a, b) => {
        const aId = extractIdFromUrl(a.url);
        const bId = extractIdFromUrl(b.url);
        return aId - bId;
      });
      const slice = sorted.slice(0, MAX_PER_GENERATION);
      const results = await Promise.all(
        slice.map((s) => searchPokemon(s.name, signal))
      );
      return results.filter((r): r is Pokemon => r !== null);
    },
    enabled: Boolean(gen),
    staleTime: 30 * 60 * 1000,
  });
}

function extractIdFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export function usePokemonsByNames(names: string[]) {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-detail", name.toLowerCase()],
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
  };
}

export function usePokemonSpecies(speciesUrl: string | undefined) {
  return useQuery<PokemonSpecies | null>({
    queryKey: ["pokemon-species", speciesUrl],
    queryFn: ({ signal }) =>
      fetchJsonPublic<PokemonSpecies>(speciesUrl!, signal),
    enabled: Boolean(speciesUrl),
    staleTime: 60 * 60 * 1000,
  });
}

function flattenEvolutionChain(node: EvolutionNode): string[] {
  const names = [node.species.name];
  for (const child of node.evolves_to) {
    names.push(...flattenEvolutionChain(child));
  }
  return names;
}

export function useEvolutionChain(speciesUrl: string | undefined) {
  return useQuery<string[]>({
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
    staleTime: 60 * 60 * 1000,
  });
}

export function useFavoritePokemons(names: string[]) {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-detail", name.toLowerCase()],
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
  };
}
