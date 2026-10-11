import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/lore.css";
import { LORE_EVENTS } from "../data/lore";
import { REGIONS } from "../data/regions";
import { HUMAN_CATEGORY_ORDER, HUMAN_LEGENDS } from "../data/humans";
import { genealogyNames } from "../data/genealogy";
import { GAME_GENERATIONS } from "../data/generations";
import { VILLAIN_TEAMS } from "../data/villains";
import { DIMENSIONS } from "../data/dimensions";
import { BATTLES } from "../data/battles";
import { MYTHS } from "../data/myths";
import { CIVILIZATIONS } from "../data/civilizations";
import { BREEDING } from "../data/breeding";
import { ITEMS } from "../data/items";
import { LANDMARKS, type LandmarkKind } from "../data/landmarks";
import { usePokemonIndex } from "../hooks/usePokemon";
import { useLore } from "../i18n/lore";
import { useLang, tr } from "../i18n/lang";
import GenealogyTree from "../components/GenealogyTree";
import PokemonChip from "../components/PokemonChip";
import WikiSource from "../components/WikiSource";
import ItemSprite from "../components/ItemSprite";
import {
  DimensionPortal,
  RegionMapIcon,
  VillainEmblem,
} from "../components/LoreArt";
import { REGION_SHAPES } from "../data/regionMap";
import { pixelSpriteUrl } from "../lib/sprites";
import { STARTERS } from "../data/rarity";
import {
  parseLoreTab,
  serializeLoreTab,
  type LoreTab,
} from "../lib/loreParams";

// Cor temática por humano (derivada de sua saga / pokemon principal)

type Tab = LoreTab;

const TAB_LABELS: Record<Tab, [string, string]> = {
  timeline: ["Cronologia", "Timeline"],
  genealogy: ["Genealogia", "Genealogy"],
  generations: ["Gerações", "Generations"],
  regions: ["Regiões", "Regions"],
  humans: ["Humanos", "Humans"],
  villains: ["Vilões", "Villains"],
  dimensions: ["Dimensões", "Dimensions"],
  battles: ["Batalhas", "Battles"],
  myths: ["Mitos", "Myths"],
  civilizations: ["Civilizações", "Civilizations"],
  breeding: ["Ovos", "Eggs"],
  items: ["Itens", "Items"],
  landmarks: ["Locais", "Places"],
};


const allPokemonNames = Array.from(
  new Set([
    ...LORE_EVENTS.flatMap((e) => e.pokemons),
    ...REGIONS.flatMap((r) => r.signature),
    ...HUMAN_LEGENDS.flatMap((h) => h.pokemons),
    ...genealogyNames(),
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
  // A lore no idioma do site; o inglês vem de data/en.
  const lore = useLore();
  const lang = useLang();
  // `t` já é a aba no laço da barra lateral; a tradução se chama `tx`.
  const tx = (pt: string, en: string) => tr(lang, pt, en);
  /**
   * A aba mora na URL, nao em useState.
   *
   * Sem isso a Lore nao era enderecavel: nao dava para mandar link para a
   * Cronologia, nem para a aba de Geracoes, nem para voltar onde se estava
   * depois de recarregar.
   */
  const [params, setParams] = useSearchParams();
  const tab = parseLoreTab(params);
  const setTab = (nova: Tab) => setParams(serializeLoreTab(nova));
  // A posição da era, não o texto: o texto muda com o idioma, a posição não.
  const [eraFilter, setEraFilter] = useState<number | undefined>(undefined);
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
    return lore.events.filter((e) => {
      if (eraFilter !== undefined && e.era !== lore.eras[eraFilter]) return false;
      if (!matchesPokemonFilter(e.pokemons)) return false;
      return true;
    });
  }, [lore, eraFilter, matchesPokemonFilter]);

  const visibleRegions = useMemo(
    () => lore.regions.filter((r) => matchesPokemonFilter(r.signature)),
    [lore, matchesPokemonFilter]
  );
  const visibleHumans = useMemo(
    () => lore.humans.filter((h) => matchesPokemonFilter(h.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleVillains = useMemo(
    () => lore.villains.filter((v) => matchesPokemonFilter(v.signature)),
    [lore, matchesPokemonFilter]
  );
  const visibleDimensions = useMemo(
    () => lore.dimensions.filter((d) => matchesPokemonFilter(d.inhabitants)),
    [lore, matchesPokemonFilter]
  );
  const visibleGenerations = useMemo(
    () => lore.generations.filter((g) => matchesPokemonFilter(g.signature)),
    [lore, matchesPokemonFilter]
  );
  const visibleBattles = useMemo(
    () => lore.battles.filter((b) => matchesPokemonFilter(b.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleMyths = useMemo(
    () => lore.myths.filter((m) => matchesPokemonFilter(m.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleCivilizations = useMemo(
    () => lore.civilizations.filter((c) => matchesPokemonFilter(c.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleBreeding = useMemo(
    () => lore.breeding.filter((b) => matchesPokemonFilter(b.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleItems = useMemo(
    () => lore.items.filter((i) => matchesPokemonFilter(i.pokemons)),
    [lore, matchesPokemonFilter]
  );
  const visibleLandmarks = useMemo(
    () => lore.landmarks.filter((l) => matchesPokemonFilter(l.pokemons)),
    [lore, matchesPokemonFilter]
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
        <h1 className="lore-sidebar-title">{tx("Universo Pokémon", "Pokémon universe")}</h1>

        <div className="lore-search">
          <input
            type="search"
            list="lore-pokemon-names"
            value={pokemonFilter ?? ""}
            onChange={(e) => setPokemonFilter(e.target.value || undefined)}
            placeholder={tx("Buscar pokémon…", "Search Pokémon…")}
            aria-label={tx("Buscar pokémon na lore", "Search Pokémon in the lore")}
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
            {tx(...TAB_LABELS[t])}
          </button>
        ))}
      </aside>

      <div className="lore-main">
        <h2 className="lore-tab-title">{tx(...TAB_LABELS[tab])}</h2>
        {tab === "timeline" && (
          <>
            <div className="lore-filters">
              <div className="lore-era-chips" role="group" aria-label={tx("Filtrar por era", "Filter by era")}>
                <button
                  type="button"
                  className={"lore-era-chip" + (eraFilter === undefined ? " active" : "")}
                  aria-pressed={eraFilter === undefined}
                  onClick={() => setEraFilter(undefined)}
                >
                  {tx("Todas", "All")}
                </button>
                {lore.eras.map((era, i) => (
                  <button
                    key={era}
                    type="button"
                    className={"lore-era-chip" + (eraFilter === i ? " active" : "")}
                    aria-pressed={eraFilter === i}
                    onClick={() => setEraFilter(i)}
                  >
                    {era}
                  </button>
                ))}
              </div>
              {pokemonFilter && (
                <div className="lore-active-filter">
                  {tx("Filtrando eventos de", "Showing events for")} <b>{pokemonFilter}</b>
                  <button onClick={clearFilters} className="lore-clear-btn">
                    {tx("limpar ✕", "clear ✕")}
                  </button>
                </div>
              )}
            </div>

            {lore.eras.filter((era) => visibleEvents.some((e) => e.era === era)).map((era) => {
              const daEra = visibleEvents.filter((e) => e.era === era);
              return (
              <section key={era} className="lore-era-section">
                {/* O nome da era era repetido ao lado de cada evento. Uma vez
                    por seção basta, e sobra espaço para o fio do tempo. */}
                <h3 className="lore-era-head">
                  {era}
                  <span className="lore-era-count">
                    {daEra.length}{" "}
                    {daEra.length === 1 ? tx("evento", "event") : tx("eventos", "events")}
                  </span>
                </h3>
                <ol className="lore-timeline-editorial">
                  {daEra
                    .map((event) => (
                      <li key={event.title} className="lore-event-editorial">
                        <div className="lore-event-body">
                          <h4 className="lore-event-title">{event.title}</h4>
                          <p className="lore-event-text">{event.body}</p>
                          <WikiSource wiki={event.wiki} />
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
              );
            })}

            {visibleEvents.length === 0 && (
              <div className="lore-empty">
                {tx("Nenhum evento encontrado com esses filtros.", "No events match these filters.")}
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar filtros", "clear filters")}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "genealogy" && (
          <div className="genealogy-container">
            <p className="genealogy-intro">
              {tx(
                "A árvore de criação — quem gerou ou moldou quem, segundo a mitologia do universo pokémon.",
                "The tree of creation — who begot or shaped whom, according to the mythology of the Pokémon universe."
              )}
            </p>
            <GenealogyTree idOf={idOf} />
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
                  {/* Os tres iniciais sao o que identifica uma geracao de
                      relance — mais do que o ano ou o numeral. */}
                  <div className="gen-slide-art" aria-hidden="true">
                    {STARTERS.slice((g.id - 1) * 3, g.id * 3).map((nome) => (
                      <img
                        key={nome}
                        src={pixelSpriteUrl(idOf(nome))}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </div>
                  <div className="gen-slide-head">
                    <span className="gen-slide-roman" aria-hidden="true">
                      {g.roman}
                    </span>
                    <div className="gen-slide-title">
                      <h3 className="gen-slide-region">
                        {g.region}
                        <span className="visually-hidden">
                          , {tx("geração", "generation")} {g.roman}
                        </span>
                      </h3>
                      <span className="gen-slide-year">{g.year}</span>
                    </div>
                  </div>
                  <div className="gen-games">
                    {g.mainGames.map((game) => (
                      <span key={game} className="gen-game-badge">
                        {game}
                      </span>
                    ))}
                  </div>
                  <p className="gen-slide-fact">{g.gimmick}</p>
                  <WikiSource wiki={g.wiki} />
                  {/* A dex saindo de 151 para 1025 e o assunto da aba, e era
                      um texto miudo. A barra poe as nove na mesma escala: o
                      trecho aceso e o que esta geracao acrescentou. */}
                  <div className="gen-growth">
                    <span className="gen-growth-bar">
                      <span
                        className="gen-growth-antes"
                        style={{ width: ((g.totalAfter - g.newPokemons) / 1025) * 100 + "%" }}
                      />
                      <span
                        className="gen-growth-novos"
                        style={{ width: (g.newPokemons / 1025) * 100 + "%" }}
                      />
                    </span>
                    <span className="gen-growth-label">
                      <strong>{g.newPokemons}</strong> {tx("novos · a dex chega a", "new · the dex reaches")}{" "}
                      {g.totalAfter}
                    </span>
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
            {tx("Nenhuma região com", "No region with")} <b>{pokemonFilter}</b>.
            <button onClick={clearFilters} className="lore-clear-btn">
              {tx("limpar busca", "clear search")}
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
                  <h3>{region.name}</h3>
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
                        <dt>{tx("Cidades", "Cities")}</dt>
                        <dd className="region-cities">{region.cities.join(" · ")}</dd>
                      </>
                    )}
                  </dl>

                  {region.gymLeaders && region.gymLeaders.length > 0 && (
                    <div className="region-gyms">
                      <div className="region-gyms-label">{tx("Líderes de Ginásio", "Gym Leaders")}</div>
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
          <div className="human-grid">
            {(() => {
              const grupos = HUMAN_CATEGORY_ORDER.filter((c) =>
                visibleHumans.some((h) => h.category === c)
              );
              if (grupos.length < 2) return null;
              return (
                <nav className="human-index" aria-label={tx("Ir para um grupo", "Jump to a group")}>
                  {grupos.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="human-index-btn"
                      onClick={() =>
                        document
                          .getElementById("humanos-" + c)
                          ?.scrollIntoView({ block: "start" })
                      }
                    >
                      {lore.humanCategoryLabels[c]}
                      <span className="human-index-count">
                        {visibleHumans.filter((h) => h.category === c).length}
                      </span>
                    </button>
                  ))}
                </nav>
              );
            })()}
            {HUMAN_CATEGORY_ORDER.filter((c) =>
              visibleHumans.some((h) => h.category === c)
            ).map((cat) => {
              const doGrupo = visibleHumans.filter((h) => h.category === cat);
              return (
                <section key={cat} id={"humanos-" + cat} className="human-section">
                  <header className="human-section-head">
                    <h3 className="human-section-name">
                      {lore.humanCategoryLabels[cat]}
                    </h3>
                    <p className="human-section-count">
                      {doGrupo.length}{" "}
                      {doGrupo.length === 1 ? tx("verbete", "entry") : tx("verbetes", "entries")}
                    </p>
                  </header>
                  <div className="editorial-grid">
                    {doGrupo.map((h) => (
                      <article
                        key={h.name}
                        className="editorial-card editorial-card-with-art"
                        style={{ ["--card-accent" as string]: h.color }}
                      >
                        {/* O time inteiro vira a arte. Retrato de treinador nao
                            existe em fonte que o projeto possa usar, e o
                            monograma de iniciais que ficava aqui nao dizia
                            nada — o primeiro sprite e o parceiro de assinatura,
                            os demais completam a escalacao. */}
                        <div
                          className="editorial-art human-art"
                          aria-hidden="true"
                          style={{ ["--time" as string]: h.pokemons.length }}
                        >
                          {h.pokemons.map((nome, i) => {
                            const arte = pixelSpriteUrl(idOf(nome));
                            if (!arte) return null;
                            return (
                              <img
                                key={nome}
                                src={arte}
                                alt=""
                                className={i === 0 ? "human-art-ace" : "human-art-time"}
                                loading="lazy"
                                decoding="async"
                              />
                            );
                          })}
                        </div>
                        <h4 className="human-name">{h.name}</h4>
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
                    ))}
                  </div>
                </section>
              );
            })}
            {visibleHumans.length === 0 && (
              <div className="lore-empty">
                {tx("Nenhum humano com", "No human with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
                </button>
              </div>
            )}
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
                <h3>{v.name}</h3>
                <p className="subtitle">
                  {v.region} · {tx("líder", "leader")}: {v.leader}
                </p>
                <p>
                  <strong>{tx("Motivação", "Motivation")}:</strong> {v.motivation}
                </p>
                <p>
                  <strong>{tx("Desfecho", "Fate")}:</strong> {v.fate}
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
                <h3 className="battle-title">{b.title}</h3>
                <p className="battle-location">
                  <strong>{b.era}</strong> · {b.location}
                </p>
                <p className="battle-summary">{b.summary}</p>
                <p className="battle-outcome">
                  <strong>{tx("Resultado", "Outcome")}:</strong> {b.outcome}
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
                {tx("Nenhuma batalha registrada com", "No recorded battle with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
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
                cat === "pokebola" ? tx("Pokébolas lendárias", "Legendary Poké Balls") :
                cat === "sagrado" ? tx("Itens sagrados", "Sacred items") :
                cat === "chave" ? tx("Itens-chave (transformações)", "Key items (transformations)") :
                cat === "cristal" ? tx("Cristais e pedras", "Crystals and stones") :
                tx("Livros e diários", "Books and journals");
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
                          <h4>{it.name}</h4>
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
                {tx("Nenhum item com", "No item with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
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
                cat === "grupo" ? tx("Grupos de Ovos", "Egg Groups") :
                cat === "regra" ? tx("Regras", "Rules") : tx("Casos especiais", "Special cases");
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
                          <h4>{b.title}</h4>
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
                {tx("Nenhum grupo/regra com", "No group/rule with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "civilizations" && (
          <div className="civ-grid">
            {visibleCivilizations.map((c) => {
              // Quem assina o sítio é o primeiro pokémon da lista curada.
              const sigCiv = pixelSpriteUrl(idOf(c.pokemons[0]));
              return (
              <article
                key={c.id}
                className="civ-card"
                style={{ ["--card-accent" as string]: c.color ?? "#c48d3a" }}
              >
                <header className="civ-header">
                  <span className="civ-stamp" aria-hidden="true">
                    {sigCiv ? (
                      <img src={sigCiv} alt="" loading="lazy" decoding="async" />
                    ) : (
                      "▲"
                    )}
                  </span>
                  <div>
                    <h3 className="civ-name">{c.name}</h3>
                    <p className="civ-loc">{c.region} · {c.age}</p>
                  </div>
                </header>
                <dl className="civ-meta">
                  <dt>{tx("Descoberta", "Discovery")}</dt>
                  <dd>{c.discovery}</dd>
                  <dt>{tx("Propósito", "Purpose")}</dt>
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
              );
            })}
            {visibleCivilizations.length === 0 && (
              <div className="lore-empty">
                {tx("Nenhuma civilização com", "No civilization with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
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
                    <h3 className="myth-title">{m.title}</h3>
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
                {tx("Nenhum mito com", "No myth with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "landmarks" && (
          <div className="landmark-grid">
            {(() => {
              const comLocais = lore.regions.filter((r) =>
                visibleLandmarks.some((l) => l.regionId === r.id)
              );
              if (comLocais.length < 2) return null;
              return (
                <nav className="landmark-index" aria-label={tx("Ir para uma região", "Jump to a region")}>
                  {comLocais.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="landmark-index-btn"
                      onClick={() =>
                        document
                          .getElementById("locais-" + r.id)
                          // Salto instantaneo: a distancia entre Kanto e Paldea passa
                          // de doze mil pixels, e rolagem suave nesse trecho leva
                          // segundos passando por setenta cards.
                          ?.scrollIntoView({ block: "start" })
                      }
                    >
                      {r.name}
                      <span className="landmark-index-count">
                        {visibleLandmarks.filter((l) => l.regionId === r.id).length}
                      </span>
                    </button>
                  ))}
                </nav>
              );
            })()}
            {lore.regions.filter((r) =>
              visibleLandmarks.some((l) => l.regionId === r.id)
            ).map((region) => {
              const shape = REGION_SHAPES.find((sh) => sh.id === region.id);
              const color = shape?.color ?? "var(--accent)";
              const marks = visibleLandmarks.filter((l) => l.regionId === region.id);
              return (
                <section
                  key={region.id}
                  id={"locais-" + region.id}
                  className="landmark-section"
                  style={{ ["--card-accent" as string]: color }}
                >
                  <header className="landmark-region-head">
                    <RegionMapIcon regionId={region.id} color={color} />
                    <div>
                      <h3 className="landmark-region-name">{region.name}</h3>
                      <p className="landmark-region-count">
                        {marks.length}{" "}
                        {marks.length === 1 ? tx("local", "place") : tx("locais", "places")}
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
                            {lore.landmarkKindLabels[l.kind as LandmarkKind]}
                          </span>
                          <h4 className="landmark-name">{l.name}</h4>
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
                {tx("Nenhum local com", "No place with")} <b>{pokemonFilter}</b>.
                <button onClick={clearFilters} className="lore-clear-btn">
                  {tx("limpar busca", "clear search")}
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
                  <DimensionPortal
                    dimId={d.id}
                    color={d.color}
                    spriteUrl={pixelSpriteUrl(idOf(d.signature))}
                  />
                </div>
                <h3>{d.name}</h3>
                <p className="subtitle">
                  {tx("Regente", "Ruler")}: {d.ruler}
                </p>
                <p>
                  <strong>{tx("Acesso", "Access")}:</strong> {d.access}
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
      </div>
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
