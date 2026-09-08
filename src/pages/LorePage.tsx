import { useCallback, useMemo, useState } from "react";
import { LORE_EVENTS, ERAS } from "../data/lore";
import { REGIONS } from "../data/regions";
import { HUMAN_LEGENDS } from "../data/humans";
import { GENEALOGY_TREE, type GenealogyNode } from "../data/genealogy";
import { GAME_GENERATIONS } from "../data/generations";
import { VILLAIN_TEAMS } from "../data/villains";
import { DIMENSIONS } from "../data/dimensions";
import { BATTLES } from "../data/battles";
import { MYTHS } from "../data/myths";
import { CIVILIZATIONS } from "../data/civilizations";
import { BREEDING } from "../data/breeding";
import { ITEMS } from "../data/items";
import {
  LANDMARKS,
  LANDMARK_KIND_LABELS,
  type LandmarkKind,
} from "../data/landmarks";
import { usePokemonIndex } from "../hooks/usePokemon";
import GenealogyTree from "../components/GenealogyTree";
import PokemonChip from "../components/PokemonChip";
import WikiSource from "../components/WikiSource";
import ItemSprite from "../components/ItemSprite";
import {
  DimensionPortal,
  HumanBadge,
  RegionMapIcon,
  VillainEmblem,
} from "../components/LoreArt";
import { REGION_SHAPES } from "../data/regionMap";
import { pixelSpriteUrl } from "../lib/sprites";

// Cor temática por humano (derivada de sua saga / pokemon principal)
const HUMAN_COLORS: Record<string, string> = {
  // Heróis antigos
  "Sir Aaron": "#c48d3a",
  "AZ": "#7ac74c",
  "Rei de Galar": "#c48d3a",
  // Professores
  "Professor Samuel Oak": "#a83a2c",
  "Professor Elm": "#c48d3a",
  "Professor Birch": "#7ac74c",
  "Professor Rowan": "#3a6cb0",
  "Professora Juniper": "#1a1a1a",
  "Professor Sycamore": "#c8ab74",
  "Professor Kukui": "#f7b32b",
  "Professora Magnolia": "#3d5a80",
  "Professores Sada e Turo": "#e63946",
  // Vilões
  "Cyrus": "#6b4a9b",
  "N (Natural Harmonia Gropius)": "#3d5a80",
  "Ghetsis": "#3a3a4a",
  "Lysandre": "#e63946",
  "Lusamine": "#f7d02c",
  "Volo": "#735797",
  // Champions
  "Red": "#dc0a2d",
  "Blue Oak": "#3a6cb0",
  "Silver": "#a1a1a6",
  "Steven Stone": "#b7b7ce",
  "Cynthia": "#c48d3a",
  "Alder": "#c22e28",
  "Iris": "#6f35fc",
  "Diantha": "#d685ad",
  "Hau": "#f7d02c",
  "Leon": "#dc0a2d",
  "Nemona": "#7ac74c",
  // Rivais e coadjuvantes
  "Lillie": "#96d9d6",
  "Gladion": "#3a3a4a",
  "Hop": "#3d5a80",
  "Marnie": "#a33ea1",
};

type Tab =
  | "timeline"
  | "genealogy"
  | "generations"
  | "regions"
  | "humans"
  | "villains"
  | "dimensions"
  | "battles"
  | "myths"
  | "civilizations"
  | "breeding"
  | "items"
  | "landmarks";

const TAB_LABELS: Record<Tab, string> = {
  timeline: "Cronologia",
  genealogy: "Genealogia",
  generations: "Gerações",
  regions: "Regiões",
  humans: "Humanos",
  villains: "Vilões",
  dimensions: "Dimensões",
  battles: "Batalhas",
  myths: "Mitos",
  civilizations: "Civilizações",
  breeding: "Ovos",
  items: "Itens",
  landmarks: "Locais",
};

function collectGenealogyNames(node: GenealogyNode, acc: string[] = []): string[] {
  acc.push(node.name);
  node.children?.forEach((c) => collectGenealogyNames(c, acc));
  return acc;
}

const allPokemonNames = Array.from(
  new Set([
    ...LORE_EVENTS.flatMap((e) => e.pokemons),
    ...REGIONS.flatMap((r) => r.signature),
    ...HUMAN_LEGENDS.flatMap((h) => h.pokemons),
    ...collectGenealogyNames(GENEALOGY_TREE),
    ...GAME_GENERATIONS.flatMap((g) => g.signature),
    ...VILLAIN_TEAMS.flatMap((v) => v.signature),
    ...DIMENSIONS.flatMap((d) => d.inhabitants),
    ...BATTLES.flatMap((b) => b.pokemons),
    ...MYTHS.flatMap((m) => m.pokemons),
    ...CIVILIZATIONS.flatMap((c) => c.pokemons),
    ...BREEDING.flatMap((b) => b.pokemons),
    ...ITEMS.flatMap((i) => i.pokemons),
    ...LANDMARKS.flatMap((l) => l.pokemons),
  ])
);

const LorePage = () => {
  const [tab, setTab] = useState<Tab>("timeline");
  const [eraFilter, setEraFilter] = useState<string | undefined>(undefined);
  const [pokemonFilter, setPokemonFilter] = useState<string | undefined>(undefined);

  // Um unico request (nome -> id) alimenta os sprites de todos os chips.
  const { idOf } = usePokemonIndex();

  // Case-insensitive substring match: "arc" cai em "arceus", "-mega" cai em qualquer mega
  const matchesPokemonFilter = useCallback(
    (list: string[]) => {
      if (!pokemonFilter) return true;
      const q = pokemonFilter.toLowerCase().trim();
      if (!q) return true;
      return list.some((n) => n.toLowerCase().includes(q));
    },
    [pokemonFilter]
  );

  const visibleEvents = useMemo(() => {
    return LORE_EVENTS.filter((e) => {
      if (eraFilter && e.era !== eraFilter) return false;
      if (!matchesPokemonFilter(e.pokemons)) return false;
      return true;
    });
  }, [eraFilter, matchesPokemonFilter]);

  const visibleRegions = useMemo(
    () => REGIONS.filter((r) => matchesPokemonFilter(r.signature)),
    [matchesPokemonFilter]
  );
  const visibleHumans = useMemo(
    () => HUMAN_LEGENDS.filter((h) => matchesPokemonFilter(h.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleVillains = useMemo(
    () => VILLAIN_TEAMS.filter((v) => matchesPokemonFilter(v.signature)),
    [matchesPokemonFilter]
  );
  const visibleDimensions = useMemo(
    () => DIMENSIONS.filter((d) => matchesPokemonFilter(d.inhabitants)),
    [matchesPokemonFilter]
  );
  const visibleGenerations = useMemo(
    () => GAME_GENERATIONS.filter((g) => matchesPokemonFilter(g.signature)),
    [matchesPokemonFilter]
  );
  const visibleBattles = useMemo(
    () => BATTLES.filter((b) => matchesPokemonFilter(b.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleMyths = useMemo(
    () => MYTHS.filter((m) => matchesPokemonFilter(m.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleCivilizations = useMemo(
    () => CIVILIZATIONS.filter((c) => matchesPokemonFilter(c.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleBreeding = useMemo(
    () => BREEDING.filter((b) => matchesPokemonFilter(b.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleItems = useMemo(
    () => ITEMS.filter((i) => matchesPokemonFilter(i.pokemons)),
    [matchesPokemonFilter]
  );
  const visibleLandmarks = useMemo(
    () => LANDMARKS.filter((l) => matchesPokemonFilter(l.pokemons)),
    [matchesPokemonFilter]
  );

  const clearFilters = () => {
    setEraFilter(undefined);
    setPokemonFilter(undefined);
  };

  const focusPokemon = (name: string) => {
    setPokemonFilter(name);
  };

  return (
    <div className="lore-shell">
      <aside className="lore-sidebar">
        <h2 className="lore-sidebar-title">Universo Pokémon</h2>

        <div className="lore-search">
          <input
            type="search"
            list="lore-pokemon-names"
            value={pokemonFilter ?? ""}
            onChange={(e) => setPokemonFilter(e.target.value || undefined)}
            placeholder="Buscar pokémon…"
            aria-label="Buscar pokémon na lore"
          />
          <datalist id="lore-pokemon-names">
            {allPokemonNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            className={"lore-sidebar-btn" + (tab === t ? " active" : "")}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </aside>

      <main className="lore-main">
        {tab === "timeline" && (
          <>
            <div className="lore-filters">
              <div className="lore-era-chips" role="tablist" aria-label="Filtrar por era">
                <button
                  type="button"
                  className={"lore-era-chip" + (!eraFilter ? " active" : "")}
                  onClick={() => setEraFilter(undefined)}
                >
                  Todas
                </button>
                {ERAS.map((era) => (
                  <button
                    key={era}
                    type="button"
                    className={"lore-era-chip" + (eraFilter === era ? " active" : "")}
                    onClick={() => setEraFilter(era)}
                  >
                    {era}
                  </button>
                ))}
              </div>
              {pokemonFilter && (
                <div className="lore-active-filter">
                  Filtrando eventos de <b>{pokemonFilter}</b>
                  <button onClick={clearFilters} className="lore-clear-btn">
                    limpar ✕
                  </button>
                </div>
              )}
            </div>

            {ERAS.filter((era) => visibleEvents.some((e) => e.era === era)).map((era) => (
              <section key={era} className="lore-era-section">
                <ol className="lore-timeline-editorial">
                  {visibleEvents
                    .filter((e) => e.era === era)
                    .map((event) => (
                      <li key={event.title} className="lore-event-editorial">
                        <div className="lore-event-era-mark">{era}</div>
                        <div className="lore-event-body">
                          <h3 className="lore-event-title">{event.title}</h3>
                          <p className="lore-event-text">{event.body}</p>
                          <div className="lore-chips">
                            {event.pokemons.map((name) => (
                              <PokemonChip
                                key={name}
                                name={name}
                                id={idOf(name)}
                                onFilter={() => setPokemonFilter(name)}
                              />
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                </ol>
              </section>
            ))}

            {visibleEvents.length === 0 && (
              <div className="lore-empty">
                Nenhum evento encontrado com esses filtros.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar filtros
                </button>
              </div>
            )}
          </>
        )}

        {tab === "genealogy" && (
          <div className="genealogy-container">
            <p className="genealogy-intro">
              A árvore de criação — quem gerou ou moldou quem, segundo a mitologia
              do universo pokémon.
            </p>
            <GenealogyTree node={GENEALOGY_TREE} idOf={idOf} />
          </div>
        )}

        {tab === "generations" && (
          <div className="gen-carousel-wrap">
            <ol className="gen-carousel">
              {visibleGenerations.map((g) => (
                <li
                  key={g.id}
                  className="gen-slide"
                  style={{ ["--gen-color" as string]: g.color }}
                >
                  <div className="gen-slide-year">{g.year}</div>
                  <div className="gen-slide-roman">Geração {g.roman}</div>
                  <div className="gen-slide-region">{g.region}</div>
                  <div className="gen-games">
                    {g.mainGames.map((game) => (
                      <span key={game} className="gen-game-badge">
                        {game}
                      </span>
                    ))}
                  </div>
                  <p className="gen-slide-fact">{g.gimmick}</p>
                  <WikiSource wiki={g.wiki} />
                  <div className="gen-slide-meta">
                    <strong>{g.newPokemons}</strong> novos · total {g.totalAfter}
                  </div>
                  <div className="lore-chips">
                    {g.signature.map((name) => (
                      <PokemonChip
                        key={name}
                        name={name}
                        id={idOf(name)}
                        onFilter={() => focusPokemon(name)}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "regions" && visibleRegions.length === 0 && (
          <div className="lore-empty">
            Nenhuma região com <b>{pokemonFilter}</b>.
            <button onClick={clearFilters} className="lore-clear-btn">
              limpar busca
            </button>
          </div>
        )}
        {tab === "regions" && (
          <div className="editorial-grid">
            {visibleRegions.map((region) => {
              const shape = REGION_SHAPES.find((s) => s.id === region.id);
              const color = shape?.color ?? "var(--accent)";
              return (
                <article
                  key={region.id}
                  className="editorial-card editorial-card-with-art"
                  style={{ ["--card-accent" as string]: color }}
                >
                  <div className="editorial-art">
                    <RegionMapIcon regionId={region.id} color={color} />
                  </div>
                  <h2>{region.name}</h2>
                  <p className="subtitle">
                    Gen {region.generation} · {region.inspiration}
                  </p>
                  <p>{region.summary}</p>
                  <WikiSource wiki={region.wiki} />

                  <dl className="region-meta">
                    {region.professor && (
                      <>
                        <dt>Professor</dt>
                        <dd>{region.professor}</dd>
                      </>
                    )}
                    {region.champion && (
                      <>
                        <dt>Champion</dt>
                        <dd>{region.champion}</dd>
                      </>
                    )}
                    {region.eliteFour && region.eliteFour.length > 0 && (
                      <>
                        <dt>Elite Four</dt>
                        <dd>{region.eliteFour.join(" · ")}</dd>
                      </>
                    )}
                    {region.cities && region.cities.length > 0 && (
                      <>
                        <dt>Cidades</dt>
                        <dd className="region-cities">{region.cities.join(" · ")}</dd>
                      </>
                    )}
                  </dl>

                  {region.gymLeaders && region.gymLeaders.length > 0 && (
                    <div className="region-gyms">
                      <div className="region-gyms-label">Líderes de Ginásio</div>
                      <ul>
                        {region.gymLeaders.map((g) => (
                          <li key={g.name}>
                            <span
                              className="card-type-dot"
                              data-type={g.type.split("/")[0]}
                              title={g.type}
                            />
                            <span className="region-gym-name">{g.name}</span>
                            {g.city && <span className="region-gym-city">{g.city}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="lore-chips">
                    {region.signature.map((name) => (
                      <PokemonChip
                        key={name}
                        name={name}
                        id={idOf(name)}
                        onFilter={() => focusPokemon(name)}
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "humans" && (
          <div className="editorial-grid">
            {visibleHumans.map((h) => {
              const color = HUMAN_COLORS[h.name] ?? "#c48d3a";
              const sigName = h.pokemons[0];
              const sigArt = pixelSpriteUrl(sigName ? idOf(sigName) : undefined);
              return (
                <article
                  key={h.name}
                  className="editorial-card editorial-card-human editorial-card-with-art"
                  style={{ ["--card-accent" as string]: color }}
                >
                  <div className="editorial-art editorial-art-portrait">
                    {sigArt && (
                      <img
                        src={sigArt}
                        alt={sigName ?? ""}
                        className="portrait-sprite"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="portrait-badge">
                      <HumanBadge name={h.name} color={color} />
                    </div>
                  </div>
                  <h2>{h.name}</h2>
                  <p className="subtitle">
                    {h.role} · {h.region}
                  </p>
                  <p>{h.summary}</p>
                  <WikiSource wiki={h.wiki} />
                  <div className="lore-chips">
                    {h.pokemons.map((name) => (
                      <PokemonChip
                        key={name}
                        name={name}
                        id={idOf(name)}
                        onFilter={() => focusPokemon(name)}
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "villains" && (
          <div className="editorial-grid">
            {visibleVillains.map((v) => {
              const sigName = v.signature[0];
              const sigArt = pixelSpriteUrl(sigName ? idOf(sigName) : undefined);
              return (
              <article
                key={v.id}
                className="editorial-card editorial-card-with-art"
                style={{ ["--card-accent" as string]: v.color }}
              >
                <div className="editorial-art editorial-art-portrait">
                  {sigArt && (
                    <img
                      src={sigArt}
                      alt={sigName ?? ""}
                      className="portrait-sprite"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="portrait-badge">
                    <VillainEmblem teamId={v.id} color={v.color} />
                  </div>
                </div>
                <h2>{v.name}</h2>
                <p className="subtitle">
                  {v.region} · líder: {v.leader}
                </p>
                <p>
                  <strong>Motivação:</strong> {v.motivation}
                </p>
                <p>
                  <strong>Desfecho:</strong> {v.fate}
                </p>
                <WikiSource wiki={v.wiki} />
                <div className="lore-chips">
                  {v.signature.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      id={idOf(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
              );
            })}
          </div>
        )}

        {tab === "battles" && (
          <div className="battles-grid">
            {visibleBattles.map((b) => (
              <article
                key={b.id}
                className="battle-card"
                style={{ ["--card-accent" as string]: b.color }}
              >
                <header className="battle-header">
                  <div className="battle-side">
                    <span className="battle-side-name">{b.contenders[0]}</span>
                  </div>
                  <div className="battle-vs" aria-hidden="true">VS</div>
                  <div className="battle-side battle-side-right">
                    <span className="battle-side-name">{b.contenders[1]}</span>
                  </div>
                </header>
                <h2 className="battle-title">{b.title}</h2>
                <p className="battle-location">
                  <strong>{b.era}</strong> · {b.location}
                </p>
                <p className="battle-summary">{b.summary}</p>
                <p className="battle-outcome">
                  <strong>Resultado:</strong> {b.outcome}
                </p>
                <WikiSource wiki={b.wiki} />
                <div className="lore-chips">
                  {b.pokemons.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      id={idOf(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
            {visibleBattles.length === 0 && (
              <div className="lore-empty">
                Nenhuma batalha registrada com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "items" && (
          <div className="items-grid">
            {(["sagrado", "pokebola", "chave", "cristal", "livro"] as const).map((cat) => {
              const items = visibleItems.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              const catLabel =
                cat === "pokebola" ? "Pokébolas lendárias" :
                cat === "sagrado" ? "Itens sagrados" :
                cat === "chave" ? "Itens-chave (transformações)" :
                cat === "cristal" ? "Cristais e pedras" :
                "Livros e diários";
              return (
                <section key={cat} className="items-section">
                  <h3 className="items-cat-label">{catLabel}</h3>
                  <div className="items-cards">
                    {items.map((it) => (
                      <article key={it.id} className={"item-card item-card-" + it.category}>
                        <ItemSprite
                          apiSlug={it.apiSlug}
                          name={it.name}
                          fallback={itemEmblem(it.category)}
                        />
                        <div className="item-body">
                          <h2>{it.name}</h2>
                          {(it.officialName || it.debut) && (
                            <p className="item-meta">
                              {it.officialName && (
                                <span className="item-official">{it.officialName}</span>
                              )}
                              {it.debut && <span className="item-debut">{it.debut}</span>}
                            </p>
                          )}
                          <p>{it.summary}</p>
                          <WikiSource wiki={it.wiki} />
                          <div className="lore-chips">
                            {it.pokemons.map((name) => (
                              <PokemonChip
                                key={name}
                                name={name}
                                id={idOf(name)}
                                onFilter={() => focusPokemon(name)}
                              />
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {visibleItems.length === 0 && (
              <div className="lore-empty">
                Nenhum item com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "breeding" && (
          <div className="breeding-grid">
            {(["grupo", "regra", "especial"] as const).map((cat) => {
              const items = visibleBreeding.filter((b) => b.category === cat);
              if (items.length === 0) return null;
              const catLabel =
                cat === "grupo" ? "Grupos de Ovos" :
                cat === "regra" ? "Regras" : "Casos especiais";
              return (
                <section key={cat} className="breeding-section">
                  <h3 className="breeding-cat-label">{catLabel}</h3>
                  <div className="breeding-cards">
                    {items.map((b) => (
                      <article key={b.id} className={"breeding-card breeding-card-" + b.category}>
                        <div className="breeding-icon" aria-hidden="true">
                          {b.category === "grupo" ? "🥚" : b.category === "regra" ? "📜" : "✨"}
                        </div>
                        <div className="breeding-body">
                          <h2>{b.title}</h2>
                          <p>{b.summary}</p>
                          <div className="lore-chips">
                            {b.pokemons.map((name) => (
                              <PokemonChip
                                key={name}
                                name={name}
                                id={idOf(name)}
                                onFilter={() => focusPokemon(name)}
                              />
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {visibleBreeding.length === 0 && (
              <div className="lore-empty">
                Nenhum grupo/regra com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "civilizations" && (
          <div className="civ-grid">
            {visibleCivilizations.map((c) => (
              <article
                key={c.id}
                className="civ-card"
                style={{ ["--card-accent" as string]: c.color ?? "#c48d3a" }}
              >
                <header className="civ-header">
                  <span className="civ-stamp" aria-hidden="true">▲</span>
                  <div>
                    <h2 className="civ-name">{c.name}</h2>
                    <p className="civ-loc">{c.region} · {c.age}</p>
                  </div>
                </header>
                <dl className="civ-meta">
                  <dt>Descoberta</dt>
                  <dd>{c.discovery}</dd>
                  <dt>Propósito</dt>
                  <dd>{c.purpose}</dd>
                </dl>
                <WikiSource wiki={c.wiki} />
                <div className="lore-chips">
                  {c.pokemons.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      id={idOf(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
            {visibleCivilizations.length === 0 && (
              <div className="lore-empty">
                Nenhuma civilização com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "myths" && (
          <div className="myth-grid">
            {visibleMyths.map((m) => {
              const sigName = m.pokemons[0];
              const sigArt = pixelSpriteUrl(sigName ? idOf(sigName) : undefined);
              return (
                <article
                  key={m.id}
                  className="myth-card"
                  style={{ ["--card-accent" as string]: m.color ?? "#c48d3a" }}
                >
                  <div className="myth-thumb">
                    {sigArt && (
                      <img
                        src={sigArt}
                        alt={sigName ?? ""}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <div className="myth-body">
                    <div className="myth-region">{m.region}</div>
                    <h2 className="myth-title">{m.title}</h2>
                    <p className="myth-summary">{m.summary}</p>
                    <WikiSource wiki={m.wiki} />
                    <div className="lore-chips">
                      {m.pokemons.map((name) => (
                        <PokemonChip
                          key={name}
                          name={name}
                          id={idOf(name)}
                          onFilter={() => focusPokemon(name)}
                        />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
            {visibleMyths.length === 0 && (
              <div className="lore-empty">
                Nenhum mito com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "landmarks" && (
          <div className="landmark-grid">
            {REGIONS.filter((r) =>
              visibleLandmarks.some((l) => l.regionId === r.id)
            ).map((region) => {
              const shape = REGION_SHAPES.find((sh) => sh.id === region.id);
              const color = shape?.color ?? "var(--accent)";
              const marks = visibleLandmarks.filter((l) => l.regionId === region.id);
              return (
                <section
                  key={region.id}
                  className="landmark-section"
                  style={{ ["--card-accent" as string]: color }}
                >
                  <header className="landmark-region-head">
                    <RegionMapIcon regionId={region.id} color={color} />
                    <div>
                      <h3 className="landmark-region-name">{region.name}</h3>
                      <p className="landmark-region-count">
                        {marks.length} {marks.length === 1 ? "local" : "locais"}
                      </p>
                    </div>
                  </header>
                  <div className="landmark-cards">
                    {marks.map((l) => (
                      <article key={l.id} className="landmark-card">
                        <div className="landmark-card-head">
                          <span
                            className={"landmark-kind landmark-kind-" + l.kind}
                          >
                            {LANDMARK_KIND_LABELS[l.kind as LandmarkKind]}
                          </span>
                          <h2 className="landmark-name">{l.name}</h2>
                        </div>
                        <p className="landmark-summary">{l.summary}</p>
                        <WikiSource wiki={l.wiki} />
                        <div className="lore-chips">
                          {l.pokemons.map((name) => (
                            <PokemonChip
                              key={name}
                              name={name}
                              id={idOf(name)}
                              onFilter={() => focusPokemon(name)}
                            />
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {visibleLandmarks.length === 0 && (
              <div className="lore-empty">
                Nenhum local com <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  limpar busca
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "dimensions" && (
          <div className="editorial-grid">
            {visibleDimensions.map((d) => (
              <article
                key={d.id}
                className="editorial-card editorial-card-dim editorial-card-with-art"
                style={{ ["--card-accent" as string]: d.color }}
              >
                <div className="editorial-art editorial-art-portal">
                  <DimensionPortal dimId={d.id} color={d.color} />
                </div>
                <h2>{d.name}</h2>
                <p className="subtitle">Regente: {d.ruler}</p>
                <p>
                  <strong>Acesso:</strong> {d.access}
                </p>
                <p>{d.description}</p>
                <WikiSource wiki={d.wiki} />
                <div className="lore-chips">
                  {d.inhabitants.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      id={idOf(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function itemEmblem(cat: "pokebola" | "sagrado" | "chave" | "cristal" | "livro") {
  const map: Record<typeof cat, string> = {
    pokebola: "◉",
    sagrado: "✦",
    chave: "⚿",
    cristal: "◆",
    livro: "❖",
  };
  return map[cat];
}

export default LorePage;
