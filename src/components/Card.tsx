import { useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { add as addToComparator } from "../lib/comparatorStore";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import { tType } from "../data/i18n";
import { preloadDetailPage } from "../pages/routeModules";
import type { Pokemon } from "../types/pokemon";

/** A API de transicao ainda nao esta na lib DOM de todo TypeScript. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

interface Props {
  pokemon: Pokemon;
  variant?: "grid" | "mini";
  linkTo?: string;
  showActions?: boolean;
  /** Posicao na grade: atrasa a entrada de cada carta em cascata. */
  index?: number;
}

const STAT_ORDER = ["hp", "attack", "defense"] as const;
const STAT_LABEL: Record<(typeof STAT_ORDER)[number], string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
};

const Card = ({
  pokemon,
  variant = "grid",
  linkTo,
  showActions = true,
  index = 0,
}: Props) => {
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltEffect(cardRef, { maxDeg: variant === "mini" ? 4 : 8 });

  const navigate = useNavigate();

  // A carta clicada vira o hero da ficha. So a variante da grade entra
  // nisso: no detalhe ja existe um hero com esse mesmo nome, e dois
  // elementos com o mesmo view-transition-name cancelam a transicao.
  //
  // A transicao e disparada na mao porque o app monta o BrowserRouter
  // classico, e o `viewTransition` do react-router exige data router.
  const flipToDetail = (e: React.MouseEvent) => {
    if (variant !== "grid" || !linkTo) return;
    // Ctrl/Cmd/Shift e o botao do meio continuam abrindo em outra aba.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const el = cardRef.current;
    const start = (document as ViewTransitionDocument).startViewTransition;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sem suporte, sem elemento ou com movimento reduzido: o Link navega
    // do jeito normal.
    if (!el || !start || still) return;

    e.preventDefault();
    void preloadDetailPage().then(() => {
      el.style.viewTransitionName = "card-flip";
      const transition = start.call(document, () => {
        // Sem o flushSync o retrato novo sai antes do React commitar.
        flushSync(() => navigate(linkTo));
      });
      void transition.finished.finally(() => {
        el.style.viewTransitionName = "";
      });
    });
  };

  const isFavorite = favoritePokemons.includes(pokemon.name);
  const isLegendary = LEGENDARY.includes(pokemon.name);
  const isMythical = MYTHICAL.includes(pokemon.name);
  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    "";

  const stats = STAT_ORDER.map((slug) => {
    const s = pokemon.stats.find((x) => x.stat.name === slug);
    return { slug, value: s?.base_stat ?? 0 };
  });

  const inner = (
    <>
      <div className="card-header">
        <div className="card-name">{pokemon.name}</div>
        <div className="card-header-right">
          <div className="card-types">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="card-type-dot"
                data-type={t.type.name}
                title={tType(t.type.name)}
              />
            ))}
          </div>
          {showActions && (
            <button
              type="button"
              className="card-fav"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateFavoritePokemons(pokemon.name);
              }}
              aria-label={
                isFavorite
                  ? `Remover ${pokemon.name} dos favoritos`
                  : `Favoritar ${pokemon.name}`
              }
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
      <div className="card-artwork">
        {artwork ? (
          <img
            src={artwork}
            crossOrigin="anonymous"
            alt={pokemon.name}
            loading="lazy"
            decoding="async"
            width={220}
            height={220}
          />
        ) : (
          <span>?</span>
        )}
      </div>
      <div className="card-footer">
        <div className="card-meta-row">
          <span className="card-id">{String(pokemon.id).padStart(4, "0")}</span>
          <span className="card-hp">
            HP <strong>{stats[0].value}</strong>
          </span>
        </div>
        {variant === "grid" && (
          <ul className="card-stats">
            {stats.slice(1).map((s) => (
              <li key={s.slug}>
                <span className="card-stat-label">{STAT_LABEL[s.slug]}</span>
                <span className="card-stat-bar">
                  <span
                    className="card-stat-fill"
                    style={{ width: `${Math.min(100, (s.value / 200) * 100)}%` }}
                  />
                </span>
                <span className="card-stat-value">{s.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showActions && (
        <button
          type="button"
          className="card-compare"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToComparator({
              name: pokemon.name,
              height: pokemon.height,
              sprite: artwork,
            });
          }}
          aria-label={`Adicionar ${pokemon.name} ao comparador`}
          title="Adicionar ao comparador"
        >
          📏
        </button>
      )}
      {/* Simbolo de raridade no canto, como na carta: le-se sem depender de cor. */}
      {isLegendary && !isMythical && (
        <span className="card-badge" title="Lendário" aria-hidden="true">
          ★
        </span>
      )}
      {isMythical && (
        <span
          className="card-badge card-badge-mythical"
          title="Mítico"
          aria-hidden="true"
        >
          ✦
        </span>
      )}
    </>
  );

  const className =
    "card" +
    ` card-${variant}` +
    (isLegendary ? " is-legendary" : "") +
    (isMythical ? " is-mythical" : "") +
    (isFavorite ? " is-favorite" : "");

  return (
    <div
      ref={cardRef}
      className={className}
      data-primary-type={primaryType}
      style={{
        ["--type-color" as string]: `var(--t-${primaryType})`,
        ["--i" as string]: String(index),
      }}
    >
      <div className="card-foil" aria-hidden="true" />
      <div className="card-spectral" aria-hidden="true" />
      <div className="card-glitter" aria-hidden="true" />
      {linkTo ? (
        <Link to={linkTo} className="card-link" onClick={flipToDetail}>
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
};

export default Card;
