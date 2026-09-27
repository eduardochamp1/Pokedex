import { useCallback, useMemo } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchJsonPublic,
  getGeneration,
  getPokedex,
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
  namesForIds,
  pageOf,
  searchNames,
  sortNamesById,
  totalPagesOf,
} from "../lib/filters";
import { RARITIES, type RarityId } from "../data/rarity";
import type { EncounterArea } from "../lib/encounters";
import type {
  EvolutionChain,
  EvolutionDetail,
  EvolutionNode,
  MoveDetail,
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

/**
 * Dex regionais da PokeAPI.
 *
 * Geracao e dex regional sao coisas diferentes, e confundi-las e o erro mais
 * facil de cometer aqui: a geracao IX trouxe 120 especies NOVAS, enquanto a
 * dex de Paldea tem 400 entradas — porque inclui tudo que aparece na regiao,
 * vindo de qualquer geracao. Quem procura "quantos pokemon tem em Paldea"
 * acha 400, e tem razao.
 *
 * Kalos e Galar nao tem uma dex unica: os jogos dividem em partes, e a lista
 * reflete isso em vez de inventar um total que nao existe.
 */
export const REGIONAL_DEXES = [
  { id: "kanto", label: "Kanto", labelEn: "Kanto" },
  { id: "original-johto", label: "Johto", labelEn: "Johto" },
  { id: "hoenn", label: "Hoenn", labelEn: "Hoenn" },
  { id: "extended-sinnoh", label: "Sinnoh", labelEn: "Sinnoh" },
  { id: "updated-unova", label: "Unova", labelEn: "Unova" },
  { id: "kalos-central", label: "Kalos · Central", labelEn: "Kalos · Central" },
  { id: "kalos-coastal", label: "Kalos · Costa", labelEn: "Kalos · Coastal" },
  { id: "kalos-mountain", label: "Kalos · Montanha", labelEn: "Kalos · Mountain" },
  { id: "updated-alola", label: "Alola", labelEn: "Alola" },
  { id: "galar", label: "Galar", labelEn: "Galar" },
  { id: "isle-of-armor", label: "Galar · Ilha da Armadura", labelEn: "Galar · Isle of Armor" },
  { id: "crown-tundra", label: "Galar · Tundra da Coroa", labelEn: "Galar · Crown Tundra" },
  { id: "hisui", label: "Hisui", labelEn: "Hisui" },
  { id: "paldea", label: "Paldea", labelEn: "Paldea" },
  { id: "kitakami", label: "Paldea · Kitakami", labelEn: "Paldea · Kitakami" },
  { id: "blueberry", label: "Paldea · Blueberry", labelEn: "Paldea · Blueberry" },
] as const;

export type RegionalDexId = (typeof REGIONAL_DEXES)[number]["id"];

export const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

/**
 * Cartas por pagina. Cada uma custa um request de detalhe, disparados em
 * paralelo e cacheados por 30 min — 25 deixava a lista completa em 55 paginas,
 * o que e navegar por indice em vez de olhar a dex.
 */
export const ITEMS_PER_PAGE = 48;

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
  const queryClient = useQueryClient();
  return useQuery<PagedResult>({
    queryKey: ["pokemon-list", page],
    queryFn: async ({ signal }) => {
      const data = await getPokemons(ITEMS_PER_PAGE, ITEMS_PER_PAGE * page, signal);
      const results = await Promise.all(
        data.results.map((p) => getPokemonData(p.url, signal))
      );
      const pokemons = results.filter((r): r is Pokemon => r !== null);
      // Estes 25 pokémons acabaram de ser buscados, mas ficavam presos nesta
      // queryKey: abrir um card da home sem filtro pedia o MESMO objeto de
      // novo, porque o detalhe procura por `["pokemon-detail", nome]`.
      // Semeando aquela chave, a navegação para o detalhe passa a ser
      // instantânea e sem request.
      for (const pokemon of pokemons) {
        queryClient.setQueryData(["pokemon-detail", pokemon.name], pokemon);
      }
      return {
        pokemons,
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

/**
 * Várias listas de tipo de uma vez, com a mesma chave de cache de
 * `useTypeNames`: o que o filtro da Home já carregou não é buscado de novo.
 */
export function useTypeLists(typeNames: string[]): Record<string, string[] | undefined> {
  const results = useQueries({
    queries: typeNames.map((typeName) => ({
      queryKey: ["type-names", typeName.toLowerCase()],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const data = await getPokemonsByType(typeName, signal);
        if (!data) return [] as string[];
        return data.pokemon.map((p) => resolveName(p.pokemon.name));
      },
      staleTime: HOUR,
    })),
  });
  const out: Record<string, string[] | undefined> = {};
  typeNames.forEach((t, i) => (out[t] = results[i]?.data));
  return out;
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

function usePokedexNames(dex: string | undefined) {
  return useQuery<string[]>({
    queryKey: ["pokedex-names", dex],
    queryFn: async ({ signal }) => {
      const data = await getPokedex(dex!, signal);
      if (!data) return [];
      return data.pokemon_entries.map((e: { pokemon_species: { name: string } }) =>
        resolveName(e.pokemon_species.name)
      );
    },
    enabled: Boolean(dex),
    staleTime: HOUR,
  });
}

export interface SelectionCriteria {
  search?: string;
  type?: string;
  generation?: number;
  /** Dex regional: o que aparece na regiao, nao o que estreou nela. */
  pokedex?: string;
  rarity?: RarityId;
  /**
   * Números nacionais que a seleção pode conter — a dex do jogo lido do save.
   * `undefined` = não participa; `[]` participa e zera o resultado.
   */
  nationals?: number[];
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
  const { search, type, generation, pokedex, rarity, nationals } = criteria;
  const { index, isLoading: indexLoading, isError: indexError } = usePokemonIndex();
  const typeQuery = useTypeNames(type);
  const genQuery = useGenerationNames(generation);
  const dexQuery = usePokedexNames(pokedex);

  const rarityNames = useMemo(() => {
    if (!rarity) return undefined;
    return RARITIES.find((r) => r.id === rarity)?.names.map(resolveName) ?? [];
  }, [rarity]);

  const searchQuery = search?.trim() ? search.trim() : undefined;
  const hasCriteria = Boolean(
    searchQuery || type || generation || pokedex || rarity || nationals
  );

  const names = useMemo(() => {
    if (!hasCriteria || !index) return null;

    const sources: string[][] = [];
    if (searchQuery) sources.push(searchNames(searchQuery, index));
    if (type) sources.push(typeQuery.data ?? []);
    if (generation) sources.push(genQuery.data ?? []);
    if (pokedex) sources.push(dexQuery.data ?? []);
    if (rarityNames) sources.push(rarityNames);
    if (nationals) sources.push(namesForIds(nationals, index));

    return sortNamesById(intersectNames(sources), index);
  }, [
    hasCriteria,
    index,
    searchQuery,
    type,
    generation,
    pokedex,
    rarityNames,
    nationals,
    typeQuery.data,
    genQuery.data,
    dexQuery.data,
  ]);

  return {
    names,
    isLoading:
      hasCriteria &&
      (indexLoading ||
        (Boolean(type) && typeQuery.isLoading) ||
        (Boolean(generation) && genQuery.isLoading) ||
        (Boolean(pokedex) && dexQuery.isLoading)),
    isError: indexError || typeQuery.isError || genQuery.isError || dexQuery.isError,
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

/**
 * Detalhe de um golpe, buscado só quando alguém abre aquele golpe.
 *
 * A lista em si não custa request nenhum — já vem no objeto do pokémon. Buscar
 * os 109 golpes do Pikachu de uma vez, para mostrar poder e precisão que quase
 * ninguém vai ler todos, seria pagar caro por nada.
 */
/**
 * Onde encontrar: uma lista por área e jogo. Vem vazia para inicial, lendário
 * de evento e evolução — a PokéAPI só lista encontro selvagem, troca e presente.
 */
export function useEncounters(id: number | undefined) {
  return useQuery<EncounterArea[] | null>({
    queryKey: ["encounters", id],
    queryFn: ({ signal }) =>
      fetchJsonPublic<EncounterArea[]>(
        `https://pokeapi.co/api/v2/pokemon/${id}/encounters`,
        signal
      ),
    enabled: id !== undefined,
    staleTime: HOUR,
  });
}

export function useMoveDetail(moveName: string | undefined) {
  return useQuery<MoveDetail | null>({
    queryKey: ["move-detail", moveName],
    queryFn: ({ signal }) =>
      fetchJsonPublic<MoveDetail>(
        `https://pokeapi.co/api/v2/move/${moveName}`,
        signal
      ),
    enabled: Boolean(moveName),
    staleTime: HOUR,
  });
}

/** Vários golpes de uma vez, com a chave de cache de `useMoveDetail`. */
export function useMoveDetails(moveNames: string[]): Record<string, MoveDetail | null | undefined> {
  const results = useQueries({
    queries: moveNames.map((moveName) => ({
      queryKey: ["move-detail", moveName],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchJsonPublic<MoveDetail>(`https://pokeapi.co/api/v2/move/${moveName}`, signal),
      staleTime: HOUR,
    })),
  });
  const out: Record<string, MoveDetail | null | undefined> = {};
  moveNames.forEach((m, i) => (out[m] = results[i]?.data));
  return out;
}

export interface EvolutionStep {
  name: string;
  /** Condicao para chegar NESTE estagio; vazio no primeiro. */
  /**
   * O dado cru da condição, e não a frase: a frase depende do idioma, e esta
   * consulta fica uma hora em cache. `EvolutionChain` monta o texto.
   */
  detail?: EvolutionDetail;
}

function flattenEvolutionChain(
  node: EvolutionNode,
  detail?: EvolutionDetail
): EvolutionStep[] {
  const steps: EvolutionStep[] = [{ name: node.species.name, detail }];
  for (const child of node.evolves_to) {
    steps.push(
      ...flattenEvolutionChain(child, child.evolution_details?.[0])
    );
  }
  return steps;
}

export function useEvolutionChain(speciesUrl: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<EvolutionStep[]>({
    queryKey: ["evolution-chain", speciesUrl],
    queryFn: async () => {
      if (!speciesUrl) return [];
      // Mesma queryKey de `usePokemonSpecies`. A página de detalhe monta os
      // dois hooks com a mesma URL: buscando por fora, a species era pedida
      // duas vezes por pokémon aberto. `fetchQuery` reaproveita o cache — e
      // quem chegar primeiro serve o outro.
      const species = await queryClient.fetchQuery({
        queryKey: ["pokemon-species", speciesUrl],
        queryFn: ({ signal }) =>
          fetchJsonPublic<PokemonSpecies>(speciesUrl, signal),
        staleTime: HOUR,
      });
      if (!species) return [];
      const chain = await fetchJsonPublic<EvolutionChain>(
        species.evolution_chain.url
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
