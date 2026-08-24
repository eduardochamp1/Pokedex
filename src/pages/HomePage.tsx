import { useMemo, useState } from "react";
import Searchbar from "../components/Searchbar";
import Pokedex from "../components/Pokedex";
import TypeFilter from "../components/TypeFilter";
import GenerationFilter from "../components/GenerationFilter";
import RarityFilter from "../components/RarityFilter";
import { CardSkeleton } from "../components/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import {
  usePokemonList,
  usePokemonSearch,
  usePokemonsByGeneration,
  usePokemonsByNames,
  usePokemonsByType,
} from "../hooks/usePokemon";
import { RARITIES, type RarityId } from "../data/rarity";

const HomePage = () => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [genFilter, setGenFilter] = useState<number | undefined>(undefined);
  const [rarityFilter, setRarityFilter] = useState<RarityId | undefined>(undefined);

  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const searchTerm = debouncedSearch || undefined;

  const listQuery = usePokemonList(page);
  const searchQuery = usePokemonSearch(searchTerm);
  const typeQuery = usePokemonsByType(typeFilter);
  const genQuery = usePokemonsByGeneration(genFilter);

  const rarityNames = useMemo(
    () => (rarityFilter ? RARITIES.find((r) => r.id === rarityFilter)!.names : []),
    [rarityFilter]
  );
  const rarityQuery = usePokemonsByNames(rarityNames);

  const isSearching = Boolean(searchTerm);
  const isFiltering =
    (Boolean(typeFilter) || Boolean(genFilter) || Boolean(rarityFilter)) &&
    !isSearching;

  // Cross-filter: intersect all active filter results by id.
  const filteredPokemons = useMemo(() => {
    if (!isFiltering) return [];
    const sources: number[][] = [];
    if (typeFilter) sources.push((typeQuery.data ?? []).map((p) => p.id));
    if (genFilter) sources.push((genQuery.data ?? []).map((p) => p.id));
    if (rarityFilter) sources.push(rarityQuery.pokemons.map((p) => p.id));

    if (sources.length === 0) return [];

    // Union of loaded pokemons keyed by id
    const byId = new Map<number, import("../types/pokemon").Pokemon>();
    for (const p of typeQuery.data ?? []) byId.set(p.id, p);
    for (const p of genQuery.data ?? []) byId.set(p.id, p);
    for (const p of rarityQuery.pokemons) byId.set(p.id, p);

    // Intersect all id sets
    const [first, ...rest] = sources;
    const intersect = first.filter((id) => rest.every((s) => s.includes(id)));

    return intersect
      .map((id) => byId.get(id))
      .filter((p): p is import("../types/pokemon").Pokemon => Boolean(p))
      .sort((a, b) => a.id - b.id);
  }, [
    isFiltering,
    typeFilter, genFilter, rarityFilter,
    typeQuery.data, genQuery.data, rarityQuery.pokemons,
  ]);

  let pokemons = listQuery.data?.pokemons ?? [];
  let isFetching = listQuery.isFetching;
  let showInitialLoading = listQuery.isLoading;
  let totalPages = listQuery.data?.totalPages ?? 0;
  let currentPage = page;

  if (isSearching) {
    pokemons = searchQuery.data ? [searchQuery.data] : [];
    isFetching = searchQuery.isFetching;
    showInitialLoading = searchQuery.isLoading;
    totalPages = 1;
    currentPage = 0;
  } else if (isFiltering) {
    pokemons = filteredPokemons;
    isFetching =
      typeQuery.isFetching || genQuery.isFetching || rarityQuery.isLoading;
    showInitialLoading =
      (Boolean(typeFilter) && typeQuery.isLoading) ||
      (Boolean(genFilter) && genQuery.isLoading) ||
      (Boolean(rarityFilter) && rarityQuery.isLoading);
    totalPages = 1;
    currentPage = 0;
  }

  const notFound =
    (isSearching && searchQuery.isSuccess && !searchQuery.data) ||
    (isFiltering && !isFetching && pokemons.length === 0);

  const onTypeChange = (v: string | undefined) => {
    setTypeFilter(v); setPage(0); setSearchInput("");
  };
  const onGenChange = (v: number | undefined) => {
    setGenFilter(v); setPage(0); setSearchInput("");
  };
  const onRarityChange = (v: RarityId | undefined) => {
    setRarityFilter(v); setPage(0); setSearchInput("");
  };

  return (
    <>
      <div className="home-controls">
        <Searchbar value={searchInput} onChange={setSearchInput} />
        <TypeFilter value={typeFilter} onChange={onTypeChange} />
        <GenerationFilter value={genFilter} onChange={onGenChange} />
        <RarityFilter value={rarityFilter} onChange={onRarityChange} />
      </div>
      {notFound ? (
        <div className="not-found-text">Nenhum pokémon encontrado.</div>
      ) : showInitialLoading ? (
        <>
          <div className="pokedex-header">
            <h1>Pokedex</h1>
          </div>
          <CardSkeleton count={12} />
        </>
      ) : (
        <Pokedex
          pokemons={pokemons}
          loading={isFetching && pokemons.length === 0}
          page={currentPage}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </>
  );
};

export default HomePage;
