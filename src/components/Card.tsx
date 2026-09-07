import { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import { tType } from "../data/i18n";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  variant?: "grid" | "mini";
  linkTo?: string;
  showActions?: boolean;
}

const STAT_ORDER = ["hp", "attack", "defense"] as const;

const Card = ({
  pokemon,
  variant = "grid",
  linkTo,
  showActions = true,
}: Props) => {
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const cardRef = useRef<HTMLDivElement>(null);
  useTiltEffect(cardRef, { maxDeg: variant === "mini" ? 4 : 8 });

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
      </div>
      <div className="card-artwork">
        {artwork ? <img src={artwork} alt={pokemon.name} /> : <span>?</span>}
      </div>
      <div className="card-footer">
        <div className="card-meta-row">
          <span className="card-id">#{String(pokemon.id).padStart(3, "0")}</span>
          <span className="card-hp">
            HP <strong>{stats[0].value}</strong>
          </span>
        </div>
        {variant === "grid" && (
          <ul className="card-stats">
            {stats.slice(1).map((s) => (
              <li key={s.slug}>
                <span className="card-stat-label">{s.slug}</span>
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
          {isFavorite ? "❤️" : "🖤"}
        </button>
      )}
      {isLegendary && !isMythical && <span className="card-badge">👑</span>}
      {isMythical && <span className="card-badge">✨</span>}
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
      style={{ ["--type-color" as string]: `var(--t-${primaryType})` }}
    >
      <div className="card-foil" aria-hidden="true" />
      {linkTo ? (
        <Link to={linkTo} className="card-link">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
};

export default Card;
