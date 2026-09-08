import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  usePokemonPage,
  usePokemonSelection,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import { tGenus, tType } from "../data/i18n";
import { pickLocalized } from "../lib/localize";
import { sortNamesAlphabetically } from "../lib/filters";
import {
  parseHomeParams,
  toSearchParams,
  SORTS,
  type HomeParams,
} from "../lib/homeParams";

const HomePage = () => {
  const [params, setParams] = useSearchParams();
  const current = parseHomeParams(params);

  /** Aplica uma mudanca parcial; qualquer criterio novo volta para a pagina 1. */
  const update = (patch: Partial<HomeParams>) => {
    const next = { ...current, ...patch };
    if (!("page" in patch)) next.page = 0;
    setParams(toSearchParams(next), { replace: true });
  };

  // Input local pra nao reescrever a URL a cada tecla; a busca debounced e que vai
  // para o parametro `q`.
  const [searchInput, setSearchInput] = useState(current.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  useEffect(() => {
    if (debouncedSearch !== current.search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const selection = usePokemonSelection({
    search: debouncedSearch,
    type: current.type,
    generation: current.generation,
    rarity: current.rarity,
  });

  const orderedNames = useMemo(() => {
    if (!selection.names) return null;
    if (current.sort === "nome") return sortNamesAlphabetically(selection.names);
    // "id" ja vem ordenado por id de usePokemonSelection.
    return selection.names;
  }, [selection.names, current.sort]);

  const selected = usePokemonPage(orderedNames, current.page);
  const listQuery = usePokemonList(current.page);

  const isSelecting = selection.names !== null;

  const featured = useFeaturedPokemon();
  const featuredSpecies = usePokemonSpecies(featured.data?.species.url);

  const pokemons = isSelecting ? selected.pokemons : listQuery.data?.pokemons ?? [];
  const totalPages = isSelecting ? selected.totalPages : listQuery.data?.totalPages ?? 1;
  const isLoading = isSelecting
    ? selection.isLoading || selected.isLoading
    : listQuery.isLoading;
  const isError = isSelecting
    ? selection.isError || selected.isError
    : listQuery.isError;
  const notFound =
    isSelecting && !isLoading && !isError && (selection.names?.length ?? 0) === 0;
  const total = isSelecting ? selected.total : undefined;

  const featuredFlavor = pickLocalized(
    featuredSpecies.data?.flavor_text_entries,
    (e) => e.flavor_text
  );
  const featuredGenus =
    pickLocalized(featuredSpecies.data?.genera, (g) => g.genus) || "Pokémon";

  return (
    <>
      {featured.data && (
        <section className="home-featured">
          <div className="home-featured-copy">
            {featuredSpecies.data && (
              <div className="home-featured-genus">{tGenus(featuredGenus)}</div>
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
          <TypeFilter
            value={current.type}
            onChange={(v) => update({ type: v })}
          />
          <h3>Geração</h3>
          <GenerationFilter
            value={current.generation}
            onChange={(v) => update({ generation: v })}
          />
          <h3>Raridade</h3>
          <RarityFilter
            value={current.rarity}
            onChange={(v) => update({ rarity: v })}
          />
          <h3>Ordenar</h3>
          <div className="type-filter">
            <label htmlFor="sort-select">Ordem:</label>
            <select
              id="sort-select"
              value={current.sort}
              onChange={(e) =>
                update({ sort: e.target.value as HomeParams["sort"] })
              }
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </aside>
        <main>
          {isError ? (
            <div className="not-found-text">
              Não foi possível consultar a PokéAPI. Verifique sua conexão e
              tente de novo.
            </div>
          ) : notFound ? (
            <div className="not-found-text">Nenhum pokémon encontrado.</div>
          ) : isLoading ? (
            <CardSkeleton count={10} />
          ) : (
            <Pokedex
              pokemons={pokemons}
              loading={selected.isLoading && pokemons.length === 0}
              page={current.page}
              setPage={(p) => update({ page: p })}
              totalPages={totalPages}
              total={total}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default HomePage;
