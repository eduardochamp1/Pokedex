import { useRef } from "react";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import { tType } from "../data/i18n";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  spriteUrl?: string;
}

const CardHero = ({ pokemon, spriteUrl }: Props) => {
  const heroRef = useRef<HTMLDivElement>(null);
  useTiltEffect(heroRef, { maxDeg: 12 });

  const isLegendary = LEGENDARY.includes(pokemon.name);
  const isMythical = MYTHICAL.includes(pokemon.name);
  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const artwork =
    spriteUrl ??
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    "";

  return (
    <div
      ref={heroRef}
      className={
        "card-hero" +
        (isLegendary ? " is-legendary" : "") +
        (isMythical ? " is-mythical" : "")
      }
      data-primary-type={primaryType}
      style={{ ["--type-color" as string]: `var(--t-${primaryType})` }}
    >
      <div className="card-foil" aria-hidden="true" />
      <div className="card-header">
        <div className="card-name">{pokemon.name}</div>
        <div className="card-types">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="card-type-dot card-type-dot-lg"
              data-type={t.type.name}
              title={tType(t.type.name)}
            >
              {tType(t.type.name)}
            </span>
          ))}
        </div>
      </div>
      <div className="card-artwork card-artwork-hero">
        {artwork ? (
          <img
            src={artwork}
            crossOrigin="anonymous"
            alt={pokemon.name}
            key={artwork}
            decoding="async"
            width={320}
            height={320}
          />
        ) : (
          <span>?</span>
        )}
      </div>
      <div className="card-footer">
        <div className="card-meta-row">
          <span className="card-id">#{String(pokemon.id).padStart(3, "0")}</span>
          <span className="card-hp">
            HP{" "}
            <strong>
              {pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0}
            </strong>
          </span>
        </div>
      </div>
      {isLegendary && !isMythical && <span className="card-badge">👑</span>}
      {isMythical && <span className="card-badge">✨</span>}
    </div>
  );
};

export default CardHero;
