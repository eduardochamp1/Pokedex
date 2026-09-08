import { useEffect, useState } from "react";
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
import { type RarityId } from "../data/rarity";
import { tGenus, tType } from "../data/i18n";
import { pickLocalized } from "../lib/localize";

const HomePage = () => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [genFilter, setGenFilter] = useState<number | undefined>(undefined);
  const [rarityFilter, setRarityFilter] = useState<RarityId | undefined>(undefined);

  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  // Busca e os tres filtros se combinam por interseccao. names === null
  // significa "nenhum criterio ativo" — cai na listagem paginada padrao.
  const selection = usePokemonSelection({
    search: debouncedSearch,
    type: typeFilter,
    generation: genFilter,
    rarity: rarityFilter,
  });
  const selected = usePokemonPage(selection.names, page);
  const listQuery = usePokemonList(page);

  const isSelecting = selection.names !== null;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, typeFilter, genFilter, rarityFilter]);

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
          <TypeFilter value={typeFilter} onChange={setTypeFilter} />
          <h3>Geração</h3>
          <GenerationFilter value={genFilter} onChange={setGenFilter} />
          <h3>Raridade</h3>
          <RarityFilter value={rarityFilter} onChange={setRarityFilter} />
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
              page={page}
              setPage={setPage}
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
