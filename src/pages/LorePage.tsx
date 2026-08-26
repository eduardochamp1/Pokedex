import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LORE_EVENTS, ERAS } from "../data/lore";
import { REGIONS } from "../data/regions";
import { HUMAN_LEGENDS } from "../data/humans";
import { GENEALOGY_TREE, type GenealogyNode } from "../data/genealogy";
import { GAME_GENERATIONS } from "../data/generations";
import { VILLAIN_TEAMS } from "../data/villains";
import { DIMENSIONS } from "../data/dimensions";
import { usePokemonsByNames } from "../hooks/usePokemon";
import GenealogyTree from "../components/GenealogyTree";
import type { Pokemon } from "../types/pokemon";

type Tab =
  | "timeline"
  | "genealogy"
  | "generations"
  | "regions"
  | "humans"
  | "villains"
  | "dimensions";

const TAB_LABELS: Record<Tab, string> = {
  timeline: "Cronologia",
  genealogy: "Genealogia",
  generations: "Gerações",
  regions: "Regiões",
  humans: "Humanos",
  villains: "Vilões",
  dimensions: "Dimensões",
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
  ])
);

const LorePage = () => {
  const [tab, setTab] = useState<Tab>("timeline");
  const [eraFilter, setEraFilter] = useState<string | undefined>(undefined);
  const [pokemonFilter, setPokemonFilter] = useState<string | undefined>(undefined);

  const { pokemons } = usePokemonsByNames(allPokemonNames);
  const byName = useMemo(() => {
    const m = new Map<string, Pokemon>();
    for (const p of pokemons) m.set(p.name, p);
    return m;
  }, [pokemons]);

  const visibleEvents = useMemo(() => {
    return LORE_EVENTS.filter((e) => {
      if (eraFilter && e.era !== eraFilter) return false;
      if (pokemonFilter && !e.pokemons.includes(pokemonFilter)) return false;
      return true;
    });
  }, [eraFilter, pokemonFilter]);

  const clearFilters = () => {
    setEraFilter(undefined);
    setPokemonFilter(undefined);
  };

  const focusPokemon = (name: string) => {
    setTab("timeline");
    setPokemonFilter(name);
  };

  return (
    <div className="lore-shell">
      <aside className="lore-sidebar">
        <h2 className="lore-sidebar-title">Universo Pokémon</h2>
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
                                pokemon={byName.get(name)}
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
            <GenealogyTree node={GENEALOGY_TREE} byName={byName} />
          </div>
        )}

        {tab === "generations" && (
          <div className="gen-carousel-wrap">
            <ol className="gen-carousel">
              {GAME_GENERATIONS.map((g) => (
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
                  <div className="gen-slide-meta">
                    <strong>{g.newPokemons}</strong> novos · total {g.totalAfter}
                  </div>
                  <div className="lore-chips">
                    {g.signature.map((name) => (
                      <PokemonChip
                        key={name}
                        name={name}
                        pokemon={byName.get(name)}
                        onFilter={() => focusPokemon(name)}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {tab === "regions" && (
          <div className="editorial-grid">
            {REGIONS.map((region) => (
              <article key={region.id} className="editorial-card">
                <h2>{region.name}</h2>
                <p className="subtitle">
                  Gen {region.generation} · {region.inspiration}
                </p>
                <p>{region.summary}</p>
                <div className="lore-chips">
                  {region.signature.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      pokemon={byName.get(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "humans" && (
          <div className="editorial-grid">
            {HUMAN_LEGENDS.map((h) => (
              <article key={h.name} className="editorial-card">
                <h2>{h.name}</h2>
                <p className="subtitle">
                  {h.role} · {h.region}
                </p>
                <p>{h.summary}</p>
                <div className="lore-chips">
                  {h.pokemons.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      pokemon={byName.get(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "villains" && (
          <div className="editorial-grid">
            {VILLAIN_TEAMS.map((v) => (
              <article
                key={v.id}
                className="editorial-card"
                style={{ ["--card-accent" as string]: v.color }}
              >
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
                <div className="lore-chips">
                  {v.signature.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      pokemon={byName.get(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "dimensions" && (
          <div className="editorial-grid">
            {DIMENSIONS.map((d) => (
              <article
                key={d.id}
                className="editorial-card editorial-card-dim"
                style={{ ["--card-accent" as string]: d.color }}
              >
                <div className="dimension-glow" aria-hidden="true" />
                <h2>{d.name}</h2>
                <p className="subtitle">Regente: {d.ruler}</p>
                <p>
                  <strong>Acesso:</strong> {d.access}
                </p>
                <p>{d.description}</p>
                <div className="lore-chips">
                  {d.inhabitants.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      pokemon={byName.get(name)}
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

interface ChipProps {
  name: string;
  pokemon: Pokemon | undefined;
  onFilter?: () => void;
}

const PokemonChip = ({ name, pokemon, onFilter }: ChipProps) => {
  const sprite =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default ??
    "";
  return (
    <span className="lore-chip-wrap">
      <Link to={`/pokemon/${name}`} className="lore-chip" title={name}>
        {sprite ? (
          <img src={sprite} alt={name} />
        ) : (
          <span className="lore-chip-placeholder">?</span>
        )}
        <span>{name}</span>
      </Link>
      {onFilter && (
        <button
          type="button"
          className="lore-chip-filter"
          onClick={onFilter}
          title={`Ver todos os eventos com ${name}`}
          aria-label={`Filtrar por ${name}`}
        >
          ⚲
        </button>
      )}
    </span>
  );
};

export default LorePage;
