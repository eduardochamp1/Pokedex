import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Searchbar from "../components/Searchbar";
import Pokedex from "../components/Pokedex";
import TypeFilter from "../components/TypeFilter";
import DexFilter from "../components/DexFilter";
import RarityFilter from "../components/RarityFilter";
import PlayerDexFilter from "../components/PlayerDexFilter";
import CardHero from "../components/CardHero";
import { CardSkeleton } from "../components/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useFeaturedPokemon } from "../hooks/useFeaturedPokemon";
// So o modulo de sessao, que le do localStorage: nao arrasta o core do
// emulador, que sao ~1,8 MB para descobrir um nome de arquivo.
import { getLastRom } from "../emulator/session";
import {
  usePokemonList,
  usePokemonPage,
  usePokemonSelection,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import { tGenus, tType } from "../data/i18n";
import { pickLocalized } from "../lib/localize";
import { sortNamesAlphabetically } from "../lib/filters";
import { dexMarkOf, nationalsFor, usePlayerDex } from "../lib/playerDex";
import { localeOf, useLang, tr } from "../i18n/lang";
import {
  parseHomeParams,
  toSearchParams,
  SORTS,
  type HomeParams,
} from "../lib/homeParams";

const HomePage = () => {
  const [params, setParams] = useSearchParams();
  const current = parseHomeParams(params);
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);

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

  /**
   * A dex do jogo lido do save em /jogar. Sem ela, `meu=` na URL e ignorado:
   * um link compartilhado nao pode esvaziar a grade de quem nunca jogou.
   */
  const playerDex = usePlayerDex();
  const mine = playerDex ? current.mine : undefined;
  const mineNationals = useMemo(
    () => (playerDex && mine ? nationalsFor(playerDex, mine) : undefined),
    [playerDex, mine]
  );
  const markOf = useCallback(
    (id: number) => dexMarkOf(playerDex, id),
    [playerDex]
  );

  const selection = usePokemonSelection({
    search: debouncedSearch,
    type: current.type,
    generation: current.generation,
    pokedex: current.pokedex,
    rarity: current.rarity,
    nationals: mineNationals,
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
  /**
   * O ultimo jogo aberto em /jogar, se houver.
   *
   * "Fechar jogo" limpa esse registro de proposito, entao quem fechou nao e
   * convidado de volta. Lido uma vez, no primeiro render: o valor so muda em
   * outra aba do site, e voltar para a Home remonta a pagina.
   */
  const ultimoJogo = useMemo(() => getLastRom(), []);
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
            <div className="home-featured-daily">
              {t("Pokémon do dia", "Pokémon of the day")} ·{" "}
              {new Date().toLocaleDateString(localeOf(lang), { day: "2-digit", month: "long" })}
            </div>
            {featuredSpecies.data && (
              <div className="home-featured-genus">{tGenus(featuredGenus)}</div>
            )}
            <h2>
              <Link to={`/pokemon/${featured.data.name}`} className="home-featured-link">
                {featured.data.name}
              </Link>
            </h2>
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

      {ultimoJogo && (
        <Link to="/jogar" className="home-resume">
          <span className="home-resume-label">{t("Você parou em", "You left off at")}</span>
          <strong>{ultimoJogo}</strong>
          <span className="home-resume-cta">{t("retomar →", "resume →")}</span>
        </Link>
      )}

      <div className="home-layout">
        <aside className="home-sidebar">
          <h3>{t("Buscar", "Search")}</h3>
          <Searchbar value={searchInput} onChange={setSearchInput} />
          <h3>{t("Tipo", "Type")}</h3>
          <TypeFilter
            value={current.type}
            onChange={(v) => update({ type: v })}
          />
          <h3>{t("Geração ou região", "Generation or region")}</h3>
          <DexFilter
            generation={current.generation}
            pokedex={current.pokedex}
            onChange={(next) =>
              // Exclusivos: escolher um limpa o outro.
              update({ generation: next.generation, pokedex: next.pokedex })
            }
          />
          <h3>{t("Raridade", "Rarity")}</h3>
          <RarityFilter
            value={current.rarity}
            onChange={(v) => update({ rarity: v })}
          />
          {playerDex && (
            <>
              <h3>{t("Seu jogo", "Your game")}</h3>
              <PlayerDexFilter
                entry={playerDex}
                value={mine}
                onChange={(v) => update({ mine: v })}
              />
            </>
          )}
          <h3>{t("Ordenar", "Sort")}</h3>
          <div className="type-filter">
            <label htmlFor="sort-select">{t("Ordem:", "Order:")}</label>
            <select
              id="sort-select"
              value={current.sort}
              onChange={(e) =>
                update({ sort: e.target.value as HomeParams["sort"] })
              }
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "en" ? s.labelEn : s.label}
                </option>
              ))}
            </select>
          </div>
        </aside>
        <div>
          {isError ? (
            <div className="not-found-text">
              {t(
                "Não foi possível consultar a PokéAPI. Verifique sua conexão e tente de novo.",
                "Couldn't reach the PokéAPI. Check your connection and try again."
              )}
            </div>
          ) : notFound ? (
            <div className="not-found-text">{t("Nenhum pokémon encontrado.", "No Pokémon found.")}</div>
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
              dexMarkOf={playerDex ? markOf : undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
