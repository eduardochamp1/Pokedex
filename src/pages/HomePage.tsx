import { useMemo, useState } from "react";
import Searchbar from "../components/Searchbar";
import Pokedex from "../components/Pokedex";
import TypeFilter from "../components/TypeFilter";
import GenerationFilter from "../components/GenerationFilter";
import RarityFilter from "../components/RarityFilter";
import CardHero from "../components/CardHero";
import { CardSkeleton } from "../components/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useFeaturedPokemon } from "../hooks/useFeaturedPokemon";
import {
  usePokemonList,
  usePokemonSearch,
  usePokemonsByGeneration,
  usePokemonsByNames,
  usePokemonSpecies,
  usePokemonsByType,
} from "../hooks/usePokemon";
import { RARITIES, type RarityId } from "../data/rarity";
import { tGenus, tType } from "../data/i18n";

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

  const featured = useFeaturedPokemon();
  const featuredSpecies = usePokemonSpecies(featured.data?.species.url);

  const rarityNames = useMemo(
    () => (rarityFilter ? RARITIES.find((r) => r.id === rarityFilter)!.names : []),
    [rarityFilter]
  );
  const rarityQuery = usePokemonsByNames(rarityNames);

  const isSearching = Boolean(searchTerm);
  const isFiltering =
    (Boolean(typeFilter) || Boolean(genFilter) || Boolean(rarityFilter)) &&
    !isSearching;

  const filteredPokemons = useMemo(() => {
    if (!isFiltering) return [];
    const sources: number[][] = [];
    if (typeFilter) sources.push((typeQuery.data ?? []).map((p) => p.id));
    if (genFilter) sources.push((genQuery.data ?? []).map((p) => p.id));
    if (rarityFilter) sources.push(rarityQuery.pokemons.map((p) => p.id));

    if (sources.length === 0) return [];

    const byId = new Map<number, import("../types/pokemon").Pokemon>();
    for (const p of typeQuery.data ?? []) byId.set(p.id, p);
    for (const p of genQuery.data ?? []) byId.set(p.id, p);
    for (const p of rarityQuery.pokemons) byId.set(p.id, p);

    const [first, ...rest] = sources;
    const intersect = first.filter((id) => rest.every((s) => s.includes(id)));

    return intersect
      .map((id) => byId.get(id))
      .filter((p): p is import("../types/pokemon").Pokemon => Boolean(p))
      .sort((a, b) => a.id - b.id);
  }, [
    isFiltering,
    typeFilter,
    genFilter,
    rarityFilter,
    typeQuery.data,
    genQuery.data,
    rarityQuery.pokemons,
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
    setTypeFilter(v);
    setPage(0);
    setSearchInput("");
  };
  const onGenChange = (v: number | undefined) => {
    setGenFilter(v);
    setPage(0);
    setSearchInput("");
  };
  const onRarityChange = (v: RarityId | undefined) => {
    setRarityFilter(v);
    setPage(0);
    setSearchInput("");
  };

  const featuredFlavor = featuredSpecies.data
    ? (
        ["pt-br", "pt", "en"]
          .map((l) => featuredSpecies.data!.flavor_text_entries.find((e) => e.language.name === l)?.flavor_text)
          .find(Boolean) ?? ""
      )
        .replace(/[\f\n\r\v]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  return (
    <>
      {featured.data && (
        <section className="home-featured">
          <div className="home-featured-copy">
            {featuredSpecies.data && (
              <div className="home-featured-genus">
                {tGenus(
                  featuredSpecies.data.genera.find((g) => g.language.name === "pt-br")?.genus ??
                  featuredSpecies.data.genera.find((g) => g.language.name === "pt")?.genus ??
                  featuredSpecies.data.genera.find((g) => g.language.name === "en")?.genus ??
                  "Pokémon"
                )}
              </div>
            )}
            <h2>{featured.data.name}</h2>
            <div className="pokemon-type">
              {featured.data.types.map((t) => (
                <span
                  key={t.type.name}
                  className="card-type-dot-lg"
                  data-type={t.type.name}
                >
                  {tType(t.type.name)}
                </span>
              ))}
            </div>
            {featuredFlavor && <p>"{featuredFlavor}"</p>}
          </div>
          <CardHero pokemon={featured.data} />
        </section>
      )}

      <div className="home-layout">
        <aside className="home-sidebar">
          <h3>Buscar</h3>
          <Searchbar value={searchInput} onChange={setSearchInput} />
          <h3>Tipo</h3>
          <TypeFilter value={typeFilter} onChange={onTypeChange} />
          <h3>Geração</h3>
          <GenerationFilter value={genFilter} onChange={onGenChange} />
          <h3>Raridade</h3>
          <RarityFilter value={rarityFilter} onChange={onRarityChange} />
        </aside>
        <main>
          {notFound ? (
            <div className="not-found-text">Nenhum pokémon encontrado.</div>
          ) : showInitialLoading ? (
            <CardSkeleton count={10} />
          ) : (
            <Pokedex
              pokemons={pokemons}
              loading={isFetching && pokemons.length === 0}
              page={currentPage}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default HomePage;
