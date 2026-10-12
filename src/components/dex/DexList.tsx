import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../../contexts/favoritesContext";
import DexFilter from "../DexFilter";
import RarityFilter from "../RarityFilter";
import { POKEMON_TYPES } from "../../hooks/usePokemon";
import { tType } from "../../data/i18n";
import { pixelSpriteUrl } from "../../lib/sprites";
import { pokemonLabel } from "../../lib/pokemonLabel";
import { SORTS, type HomeParams } from "../../lib/homeParams";
import { useLang, tr } from "../../i18n/lang";
import type { Pokemon } from "../../types/pokemon";

export type DexView = "list" | "grid";
const VIEW_KEY = "pokedex:dex-view";

function readView(): DexView {
  try {
    return localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

/** Sem acento: é o que a fonte bitmap consegue escrever. */
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

interface Props {
  current: HomeParams;
  update: (patch: Partial<HomeParams>) => void;
  searchInput: string;
  onSearch: (value: string) => void;
  pokemons: Pokemon[];
  /** Total da seleção, quando há filtro ou busca. */
  total: number | undefined;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  /** Nome (slug) do pokémon aberto na ficha. */
  selected: string | undefined;
  /** Query string atual, para o link da ficha não perder os filtros. */
  search: string;
  onPick: () => void;
}

/**
 * A tela da esquerda da Pokédex: busca, filtros e a lista (ou grade).
 */
const DexList = ({
  current,
  update,
  searchInput,
  onSearch,
  pokemons,
  total,
  totalPages,
  isLoading,
  isError,
  selected,
  search,
  onPick,
}: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { favoritePokemons } = useContext(FavoriteContext);
  const [view, setViewState] = useState<DexView>(readView);
  const filtrosAtivos = Boolean(current.generation || current.pokedex || current.rarity || current.sort !== "id");
  const [filtros, setFiltros] = useState(filtrosAtivos);

  const setView = (v: DexView) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // sem armazenamento: a escolha vale só para esta visita
    }
  };

  const numero = (id: number) => String(id).padStart(4, "0");
  const vazio = !isLoading && !isError && pokemons.length === 0;

  return (
    <>
      <div className="pane-bar">
        <div className="pane-bar-row">
          <input
            className="pane-input"
            type="search"
            value={searchInput}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("Buscar Pokémon ou número", "Search Pokémon or number")}
            aria-label={t("Buscar Pokémon ou número", "Search Pokémon or number")}
          />
          <div className="dex-view" role="group" aria-label={t("Visualização", "View")}>
            <button type="button" aria-pressed={view === "list"} aria-label={t("Lista", "List")} onClick={() => setView("list")}>
              ☰
            </button>
            <button type="button" aria-pressed={view === "grid"} aria-label={t("Grade", "Grid")} onClick={() => setView("grid")}>
              ▦
            </button>
          </div>
        </div>

        <div className="dex-chips" role="group" aria-label={t("Filtrar por tipo", "Filter by type")}>
          {POKEMON_TYPES.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className="dex-chip"
              aria-pressed={current.type === tipo}
              onClick={() => update({ type: current.type === tipo ? undefined : tipo })}
            >
              <span className="dex-chip-dot" style={{ background: `var(--t-${tipo})` }} />
              {semAcento(tType(tipo, lang))}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="dex-filtros-toggle px"
          aria-expanded={filtros}
          onClick={() => setFiltros((v) => !v)}
        >
          {filtros ? "▼" : "▶"} {t("FILTROS", "FILTERS")}
          {filtrosAtivos && <span className="dex-filtros-on"> ●</span>}
        </button>
        {filtros && (
          <div className="dex-filtros">
            <DexFilter
              generation={current.generation}
              pokedex={current.pokedex}
              onChange={(next) => update({ generation: next.generation, pokedex: next.pokedex })}
            />
            <RarityFilter value={current.rarity} onChange={(v) => update({ rarity: v })} />
            <div className="type-filter">
              <label htmlFor="sort-select">{t("Ordem:", "Order:")}</label>
              <select
                id="sort-select"
                value={current.sort}
                onChange={(e) => update({ sort: e.target.value as HomeParams["sort"] })}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "en" ? s.labelEn : s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="pane-scroll" aria-busy={isLoading}>
        {isError ? (
          <p className="pane-empty">
            {t("SEM SINAL DA POKEAPI", "NO SIGNAL FROM POKEAPI")}
            <br />
            {t("CONFIRA A CONEXAO", "CHECK YOUR CONNECTION")}
          </p>
        ) : isLoading && pokemons.length === 0 ? (
          <p className="pane-empty">{t("CARREGANDO…", "LOADING…")}</p>
        ) : vazio ? (
          <p className="pane-empty">
            {t("NENHUM POKEMON", "NO POKEMON")}
            <br />
            {t("ENCONTRADO", "FOUND")}
          </p>
        ) : view === "list" ? (
          <ul className="dex-rows">
            {pokemons.map((p) => {
              const sel = p.name === selected;
              return (
                <li key={p.id}>
                  <Link
                    to={{ pathname: `/pokemon/${p.name}`, search }}
                    className="pane-row dex-row"
                    aria-current={sel ? "true" : undefined}
                    onClick={onPick}
                  >
                    <span className="dex-cursor" aria-hidden="true">
                      {sel ? "▶" : ""}
                    </span>
                    <img className="pixelated" src={pixelSpriteUrl(p.id)} width={72} height={72} alt="" loading="lazy" />
                    <span className="dex-num">{numero(p.id)}</span>
                    <span className="dex-name">{pokemonLabel(p.name, lang)}</span>
                    <span className="dex-dots">
                      {p.types.map((ty) => (
                        <span
                          key={ty.type.name}
                          className="type-dot"
                          style={{ background: `var(--t-${ty.type.name})` }}
                          title={tType(ty.type.name, lang)}
                        />
                      ))}
                    </span>
                    <span className="dex-fav" aria-hidden="true">
                      {favoritePokemons.includes(p.name) ? "♥" : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="dex-grid">
            {pokemons.map((p) => (
              <li key={p.id}>
                <Link
                  to={{ pathname: `/pokemon/${p.name}`, search }}
                  className="pane-row dex-cell"
                  aria-current={p.name === selected ? "true" : undefined}
                  onClick={onPick}
                >
                  <span className="dex-cell-num">{numero(p.id)}</span>
                  <span className="dex-cell-fav" aria-hidden="true">
                    {favoritePokemons.includes(p.name) ? "♥" : ""}
                  </span>
                  <img className="pixelated" src={pixelSpriteUrl(p.id)} width={96} height={96} alt="" loading="lazy" />
                  <span className="dex-cell-name">{pokemonLabel(p.name, lang)}</span>
                  <span className="dex-dots">
                    {p.types.map((ty) => (
                      <span key={ty.type.name} className="type-dot" style={{ background: `var(--t-${ty.type.name})` }} />
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pane-foot">
        <span>
          {total !== undefined
            ? t(`${pokemons.length} DE ${total} REGISTRADOS`, `${pokemons.length} OF ${total} ENTRIES`)
            : t(`${pokemons.length} NESTA PAGINA`, `${pokemons.length} ON THIS PAGE`)}
        </span>
        <span className="dex-pager">
          <button
            type="button"
            aria-label={t("Página anterior", "Previous page")}
            disabled={current.page <= 0}
            onClick={() => update({ page: current.page - 1 })}
          >
            ◀
          </button>
          <span>
            {current.page + 1}/{totalPages}
          </span>
          <button
            type="button"
            aria-label={t("Próxima página", "Next page")}
            disabled={current.page + 1 >= totalPages}
            onClick={() => update({ page: current.page + 1 })}
          >
            ▶
          </button>
        </span>
      </div>
    </>
  );
};

export default DexList;
