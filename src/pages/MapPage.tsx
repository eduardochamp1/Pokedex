import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WorldMap from "../components/WorldMap";
import { REGIONS } from "../data/regions";
import { REGION_SHAPES } from "../data/regionMap";
import { LORE_EVENTS } from "../data/lore";
import { HUMAN_LEGENDS } from "../data/humans";
import { VILLAIN_TEAMS } from "../data/villains";
import { LANDMARKS, LANDMARK_KIND_LABELS } from "../data/landmarks";
import { usePokemonIndex } from "../hooks/usePokemon";
import PokemonChip from "../components/PokemonChip";
import WikiSource from "../components/WikiSource";

const MapPage = () => {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("region") ?? undefined;
  const setSelectedId = (id: string | undefined) => {
    if (id) setParams({ region: id });
    else setParams({});
  };

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

  // Um request para o indice nome -> id; os sprites dos chips saem dele.
  const { idOf } = usePokemonIndex();

  const landmarks = useMemo(
    () => (region ? LANDMARKS.filter((l) => l.regionId === region.id) : []),
    [region]
  );

  const unknownRegion = Boolean(selectedId) && !region;

  return (
    <div className="mappage-container">
      <header className="mappage-header">
        <h1>Mapa do Mundo Pokémon</h1>
        <p className="mappage-intro">
          Passe o mouse sobre uma região para ver detalhes; clique para explorar
          sua lore, pokémons lendários, humanos e vilões.
        </p>
      </header>

      {unknownRegion && (
        <p className="mappage-notice" role="status">
          Não encontramos a região <b>{selectedId}</b>. Escolha uma no mapa
          abaixo.
        </p>
      )}

      <WorldMap onSelect={setSelectedId} selectedId={selectedId} />

      {region && shape && (
        <section
          className="mappage-detail"
          style={{ ["--region-color" as string]: shape.color }}
          aria-live="polite"
        >
          <div className="mappage-dossier-head">
            <svg
              viewBox="0 0 1000 600"
              className="mappage-dossier-map"
              aria-hidden="true"
            >
              <path d={shape.path} fill={shape.color} opacity="0.9" />
            </svg>
            <div className="mappage-dossier-title">
              <span className="mappage-dossier-stamp">DOSSIER</span>
              <h2 className="mappage-detail-name">{region.name}</h2>
              <p className="mappage-detail-sub">
                Geração {region.generation} · {region.inspiration}
              </p>
              <button
                type="button"
                className="mappage-close"
                onClick={() => setSelectedId(undefined)}
                aria-label="Fechar detalhes"
              >
                ✕
              </button>
            </div>
          </div>

          <p className="mappage-detail-summary">{region.summary}</p>
          <WikiSource wiki={region.wiki} />

          <section className="mappage-block">
            <h3>Pokémons emblemáticos</h3>
            <div className="mappage-chips">
              {region.signature.map((name) => (
                <PokemonChip key={name} name={name} id={idOf(name)} />
              ))}
            </div>
          </section>

          {landmarks.length > 0 && (
            <section className="mappage-block">
              <h3>Ilhas e locais notáveis</h3>
              <ul className="mappage-landmarks">
                {landmarks.map((l) => (
                  <li key={l.id}>
                    <span className={"landmark-kind landmark-kind-" + l.kind}>
                      {LANDMARK_KIND_LABELS[l.kind]}
                    </span>
                    <div className="mappage-landmark-body">
                      <strong>{l.name}</strong> — {l.summary}
                      <WikiSource wiki={l.wiki} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
