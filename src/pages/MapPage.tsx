import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WorldMap from "../components/WorldMap";
import { REGION_SHAPES } from "../data/regionMap";
import { useLore } from "../i18n/lore";
import { useLang, tr } from "../i18n/lang";
import { generationLabel } from "../i18n/common";
import { usePokemonIndex } from "../hooks/usePokemon";
import PokemonChip from "../components/PokemonChip";
import WikiSource from "../components/WikiSource";

const MapPage = () => {
  const [params, setParams] = useSearchParams();
  const lore = useLore();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const selectedId = params.get("region") ?? undefined;
  const setSelectedId = (id: string | undefined) => {
    if (id) setParams({ region: id });
    else setParams({});
  };

  const region = lore.regions.find((r) => r.id === selectedId);
  const shape = REGION_SHAPES.find((s) => s.id === selectedId);

  const relatedEvents = useMemo(() => {
    if (!region) return [];
    const sig = new Set(region.signature);
    return lore.events.filter((e) => e.pokemons.some((p) => sig.has(p)));
  }, [lore, region]);

  const relatedHumans = useMemo(() => {
    if (!region) return [];
    return lore.humans.filter((h) =>
      h.region.toLowerCase().includes(region.name.toLowerCase())
    );
  }, [lore, region]);

  const relatedVillains = useMemo(() => {
    if (!region) return [];
    return lore.villains.filter((v) =>
      v.region.toLowerCase().includes(region.name.toLowerCase())
    );
  }, [lore, region]);

  // Um request para o indice nome -> id; os sprites dos chips saem dele.
  const { idOf } = usePokemonIndex();

  const landmarks = useMemo(
    () => (region ? lore.landmarks.filter((l) => l.regionId === region.id) : []),
    [lore, region]
  );

  const unknownRegion = Boolean(selectedId) && !region;

  return (
    <div className="mappage-container">
      <header className="mappage-header">
        <h1>{t("Mapa do Mundo Pokémon", "Map of the Pokémon world")}</h1>
        <p className="mappage-intro">
          {t(
            "Passe o mouse sobre uma região para ver detalhes; clique para explorar sua lore, pokémons lendários, humanos e vilões.",
            "Hover over a region to see details; click to explore its lore, legendary Pokémon, humans and villains."
          )}
        </p>
      </header>

      {unknownRegion && (
        <p className="mappage-notice" role="status">
          {t("Não encontramos a região", "We couldn't find the region")} <b>{selectedId}</b>.{" "}
          {t("Escolha uma no mapa abaixo.", "Pick one on the map below.")}
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
                {generationLabel(region.generation, lang)} · {region.inspiration}
              </p>
              <button
                type="button"
                className="mappage-close"
                onClick={() => setSelectedId(undefined)}
                aria-label={t("Fechar detalhes", "Close details")}
              >
                ✕
              </button>
            </div>
          </div>

          <p className="mappage-detail-summary">{region.summary}</p>
          <WikiSource wiki={region.wiki} />

          <section className="mappage-block">
            <h3>{t("Pokémons emblemáticos", "Signature Pokémon")}</h3>
            <div className="mappage-chips">
              {region.signature.map((name) => (
                <PokemonChip key={name} name={name} id={idOf(name)} />
              ))}
            </div>
          </section>

          {landmarks.length > 0 && (
            <section className="mappage-block">
              <h3>{t("Ilhas e locais notáveis", "Islands and notable places")}</h3>
              <ul className="mappage-landmarks">
                {landmarks.map((l) => (
                  <li key={l.id}>
                    <span className={"landmark-kind landmark-kind-" + l.kind}>
                      {lore.landmarkKindLabels[l.kind]}
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
              <h3>{t("Eventos da mitologia local", "Local mythology events")}</h3>
              <ul className="mappage-events">
                {relatedEvents.slice(0, 4).map((e) => (
                  <li key={e.title}>
                    <strong>{e.title}</strong> — {e.body}
                  </li>
                ))}
              </ul>
              {relatedEvents.length > 4 && (
                <Link to="/lore" className="mappage-link">
                  {t("Ver todos", "See all")} ({relatedEvents.length}){" "}
                  {t("na cronologia →", "in the timeline →")}
                </Link>
              )}
            </section>
          )}

          {relatedHumans.length > 0 && (
            <section className="mappage-block">
              <h3>{t("Figuras humanas", "Human figures")}</h3>
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
              <h3>{t("Organizações antagonistas", "Antagonist organizations")}</h3>
              <ul className="mappage-list">
                {relatedVillains.map((v) => (
                  <li key={v.id}>
                    <strong>{v.name}</strong> ({t("líder", "leader")}: {v.leader}) — {v.motivation}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mappage-actions">
            <Link to="/lore" className="mappage-cta">
              {t("Explorar a lore completa →", "Explore the full lore →")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default MapPage;
