import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WorldMap from "../components/WorldMap";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import { REGION_SHAPES } from "../data/regionMap";
import { useLore } from "../i18n/lore";
import { useLang, tr } from "../i18n/lang";
import { generationLabel } from "../i18n/common";
import { usePokemonIndex } from "../hooks/usePokemon";
import PokemonChip from "../components/PokemonChip";
import WikiSource from "../components/WikiSource";
import "../styles/map.css";

const MapPage = () => {
  const [params, setParams] = useSearchParams();
  const lore = useLore();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const selectedId = params.get("region") ?? undefined;
  const { setPane } = useDevicePage({ labels: [t("MAPA", "MAP"), t("DOSSIE", "DOSSIER")] });
  const setSelectedId = (id: string | undefined) => {
    if (id) {
      setParams({ region: id });
      // No celular, escolher uma região já abre o dossiê.
      setPane("right");
    } else setParams({});
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
    <Panes
      leftLabel={t("Mapa do mundo Pokémon", "Map of the Pokémon world")}
      rightLabel={t("Dossiê da região", "Region dossier")}
      left={
        <>
          <div className="pane-bar">
            <h2 className="pane-h">{t("MAPA DO MUNDO POKEMON", "MAP OF THE POKEMON WORLD")}</h2>
            <p className="map-hint">
              {t("Toque numa região para abrir o dossiê.", "Tap a region to open its dossier.")}
            </p>
          </div>
          <div className="pane-scroll map-stage">
            <WorldMap onSelect={setSelectedId} selectedId={selectedId} />
          </div>
        </>
      }
      right={
        region && shape ? (
          <>
            <header className="pane-band" style={{ ["--region-color" as string]: shape.color }}>
              <span className="px">
                {t("DOSSIE", "DOSSIER")} · {t("GERACAO", "GENERATION")} {region.generation}
              </span>
              <h2>{region.name}</h2>
              <span className="map-inspiracao">
                {generationLabel(region.generation, lang)} · {region.inspiration}
              </span>
            </header>
            <div className="pane-scroll pane-scroll-loose map-dossie" aria-live="polite">
          <p className="mappage-detail-summary">{region.summary}</p>
          <WikiSource wiki={region.wiki} />

          <section className="pane-card mappage-block">
            <h3>{t("Pokémons emblemáticos", "Signature Pokémon")}</h3>
            <div className="mappage-chips">
              {region.signature.map((name) => (
                <PokemonChip key={name} name={name} id={idOf(name)} />
              ))}
            </div>
          </section>

          {landmarks.length > 0 && (
            <section className="pane-card mappage-block">
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
            <section className="pane-card mappage-block">
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
            <section className="pane-card mappage-block">
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
            <section className="pane-card mappage-block">
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


              <Link to="/lore?aba=regions" className="pane-btn map-cta">
                {t("EXPLORAR A LORE →", "EXPLORE THE LORE →")}
              </Link>
            </div>
          </>
        ) : (
          <p className="pane-empty" role="status">
            {unknownRegion ? (
              <>
                {t("REGIAO NAO ENCONTRADA", "REGION NOT FOUND")}
                <br />
              </>
            ) : null}
            {t("SELECIONE UMA REGIAO", "SELECT A REGION")}
            <br />
            {t("NO MAPA", "ON THE MAP")}
          </p>
        )
      }
    />
  );
};

export default MapPage;
