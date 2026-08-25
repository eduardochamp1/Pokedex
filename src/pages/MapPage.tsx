import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorldMap from "../components/WorldMap";
import { REGIONS } from "../data/regions";
import { REGION_SHAPES } from "../data/regionMap";
import { LORE_EVENTS } from "../data/lore";
import { HUMAN_LEGENDS } from "../data/humans";
import { VILLAIN_TEAMS } from "../data/villains";
import { usePokemonsByNames } from "../hooks/usePokemon";
import type { Pokemon } from "../types/pokemon";

const MapPage = () => {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const region = REGIONS.find((r) => r.id === selectedId);
  const shape = REGION_SHAPES.find((s) => s.id === selectedId);

  const relatedEvents = useMemo(() => {
    if (!region) return [];
    const sig = new Set(region.signature);
    return LORE_EVENTS.filter((e) => e.pokemons.some((p) => sig.has(p)));
  }, [region]);

  const relatedHumans = useMemo(() => {
    if (!region) return [];
    return HUMAN_LEGENDS.filter((h) =>
      h.region.toLowerCase().includes(region.name.toLowerCase())
    );
  }, [region]);

  const relatedVillains = useMemo(() => {
    if (!region) return [];
    return VILLAIN_TEAMS.filter((v) =>
      v.region.toLowerCase().includes(region.name.toLowerCase())
    );
  }, [region]);

  const allNames = REGIONS.flatMap((r) => r.signature);
  const { pokemons } = usePokemonsByNames(allNames);
  const byName = new Map<string, Pokemon>();
  for (const p of pokemons) byName.set(p.name, p);

  return (
    <div className="mappage-container">
      <header className="mappage-header">
        <h1>Mapa do Mundo Pokémon</h1>
        <p className="mappage-intro">
          Passe o mouse sobre uma região para ver detalhes; clique para
          explorar sua lore, pokémons lendários, humanos e vilões.
        </p>
      </header>

      <WorldMap onSelect={setSelectedId} selectedId={selectedId} />

      {region && shape && (
        <section
          className="mappage-detail"
          style={{ ["--region-color" as string]: shape.color }}
          aria-live="polite"
        >
          <header className="mappage-detail-head">
            <div>
              <h2 className="mappage-detail-name">{region.name}</h2>
              <p className="mappage-detail-sub">
                Geração {region.generation} · {region.inspiration}
              </p>
            </div>
            <button
              type="button"
              className="mappage-close"
              onClick={() => setSelectedId(undefined)}
              aria-label="Fechar detalhes"
            >
              ✕
            </button>
          </header>

          <p className="mappage-detail-summary">{region.summary}</p>

          <section className="mappage-block">
            <h3>Pokémons emblemáticos</h3>
            <div className="lore-event-pokemons">
              {region.signature.map((name) => {
                const p = byName.get(name);
                const sprite =
                  p?.sprites.other?.["official-artwork"]?.front_default ??
                  p?.sprites.front_default ??
                  "";
                return (
                  <Link
                    to={`/pokemon/${name}`}
                    key={name}
                    className="lore-pokemon-chip"
                    title={name}
                  >
                    {sprite ? (
                      <img src={sprite} alt={name} />
                    ) : (
                      <span className="lore-pokemon-placeholder">?</span>
                    )}
                    <span>{name}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {relatedEvents.length > 0 && (
            <section className="mappage-block">
              <h3>Eventos da mitologia local</h3>
              <ul className="mappage-events">
                {relatedEvents.slice(0, 4).map((e) => (
                  <li key={e.title}>
                    <strong>{e.title}</strong> — {e.body}
                  </li>
                ))}
              </ul>
              {relatedEvents.length > 4 && (
                <Link to="/lore" className="mappage-link">
                  Ver todos ({relatedEvents.length}) na cronologia →
                </Link>
              )}
            </section>
          )}

          {relatedHumans.length > 0 && (
            <section className="mappage-block">
              <h3>Figuras humanas</h3>
              <ul className="mappage-list">
                {relatedHumans.map((h) => (
                  <li key={h.name}>
                    <strong>{h.name}</strong> — {h.role}. {h.summary}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedVillains.length > 0 && (
            <section className="mappage-block">
              <h3>Organizações antagonistas</h3>
              <ul className="mappage-list">
                {relatedVillains.map((v) => (
                  <li key={v.id}>
                    <strong>{v.name}</strong> (líder: {v.leader}) — {v.motivation}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mappage-actions">
            <Link to="/lore" className="mappage-cta">
              Explorar a lore completa →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default MapPage;
