import { useRef } from "react";
import { useTiltEffect } from "../hooks/useTiltEffect";
import { LEGENDARY, MYTHICAL } from "../data/rarity";
import { tType } from "../data/i18n";
import { displayName } from "../api";
import type { Pokemon } from "../types/pokemon";
import { useT } from "../i18n/lang";

interface Props {
  pokemon: Pokemon;
  spriteUrl?: string;
  /**
   * Nome da transicao de view. So a ficha passa: e la que o hero e o
   * destino da carta clicada. Na home o hero e so destaque, e dois
   * elementos com o mesmo nome cancelariam a transicao.
   */
  viewTransitionName?: string;
}

const CardHero = ({ pokemon, spriteUrl, viewTransitionName }: Props) => {
  const t = useT();
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
      style={{
        ["--type-color" as string]: `var(--t-${primaryType})`,
        ...(viewTransitionName ? { viewTransitionName } : null),
      }}
    >
      <div className="card-foil" aria-hidden="true" />
      <div className="card-spectral" aria-hidden="true" />
      <div className="card-glitter" aria-hidden="true" />
      <div className="card-header">
        <div className="card-name">{displayName(pokemon.name)}</div>
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
          <span className="card-id">{String(pokemon.id).padStart(4, "0")}</span>
          <span className="card-hp">
            {t("PS", "HP")}{" "}
            <strong>
              {pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0}
            </strong>
          </span>
        </div>
      </div>
      {/* Simbolo de raridade no canto, como na carta: le-se sem depender de cor. */}
      {isLegendary && !isMythical && (
        <span className="card-badge" title={t("Lendário", "Legendary")} aria-hidden="true">
          ★
        </span>
      )}
      {isMythical && (
        <span
          className="card-badge card-badge-mythical"
          title={t("Mítico", "Mythical")}
          aria-hidden="true"
        >
          ✦
        </span>
      )}
    </div>
  );
};

export default CardHero;
