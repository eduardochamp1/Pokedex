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
    <div className="lore-container">
      <header className="lore-header">
        <h1>Universo Pokémon</h1>
        <p className="lore-intro">
          Cronologia, genealogia, regiões, humanos, vilões e dimensões que
          compõem o mundo pokémon.
        </p>
      </header>

      <div className="lore-tabs" role="tablist">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={"lore-tab" + (tab === t ? " lore-tab-active" : "")}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

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

          {ERAS.filter((era) => visibleEvents.some((e) => e.era === era)).map(
            (era) => (
              <section key={era} className="lore-era">
                <h2 className="lore-era-title">{era}</h2>
                <ol className="lore-timeline">
                  {visibleEvents
                    .filter((e) => e.era === era)
                    .map((event) => (
                      <li key={event.title} className="lore-event">
                        <div className="lore-event-marker" aria-hidden="true" />
                        <div className="lore-event-body">
                          <h3 className="lore-event-title">{event.title}</h3>
                          <p className="lore-event-text">{event.body}</p>
                          <div className="lore-event-pokemons">
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
            )
          )}

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
        <ol className="gen-timeline">
          {GAME_GENERATIONS.map((g) => (
            <li key={g.id} className="gen-item" style={{ ["--gen-color" as string]: g.color }}>
              <div className="gen-marker">
                <span className="gen-year">{g.year}</span>
                <span className="gen-roman">{g.roman}</span>
              </div>
              <div className="gen-card">
                <h2 className="gen-title">
                  Geração {g.roman} — <span>{g.region}</span>
                </h2>
                <div className="gen-games">
                  {g.mainGames.map((game) => (
                    <span key={game} className="gen-game-badge">{game}</span>
                  ))}
                </div>
                <ul className="gen-facts">
                  <li>
                    <strong>Novos pokémon:</strong> {g.newPokemons} (total: {g.totalAfter})
                  </li>
                  <li>
                    <strong>Novidade:</strong> {g.gimmick}
                  </li>
                </ul>
                <div className="lore-event-pokemons">
                  {g.signature.map((name) => (
                    <PokemonChip
                      key={name}
                      name={name}
                      pokemon={byName.get(name)}
                      onFilter={() => focusPokemon(name)}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {tab === "regions" && (
        <div className="regions-grid">
          {REGIONS.map((region) => (
            <article key={region.id} className="region-card">
              <div className="region-head">
                <h2 className="region-name">{region.name}</h2>
                <span className="region-gen">Gen {region.generation}</span>
              </div>
              <p className="region-inspiration">{region.inspiration}</p>
              <p className="region-summary">{region.summary}</p>
              <div className="lore-event-pokemons">
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
        <div className="humans-grid">
          {HUMAN_LEGENDS.map((h) => (
            <article key={h.name} className="human-card">
              <header className="human-head">
                <h2 className="human-name">{h.name}</h2>
                <span className="human-role">{h.role}</span>
              </header>
              <p className="human-region">{h.region}</p>
              <p className="human-summary">{h.summary}</p>
              <div className="lore-event-pokemons">
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
        <div className="villains-grid">
          {VILLAIN_TEAMS.map((v) => (
            <article
              key={v.id}
              className="villain-card"
              style={{ ["--villain-color" as string]: v.color }}
            >
              <header className="villain-head">
                <h2 className="villain-name">{v.name}</h2>
                <span className="villain-region">{v.region}</span>
              </header>
              <div className="villain-leader">
                <strong>Líder:</strong> {v.leader}
              </div>
              <p className="villain-summary">
                <strong>Motivação: </strong>
                {v.motivation}
              </p>
              <p className="villain-summary">
                <strong>Desfecho: </strong>
                {v.fate}
              </p>
              <div className="lore-event-pokemons">
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
        <div className="dimensions-grid">
          {DIMENSIONS.map((d) => (
            <article
              key={d.id}
              className="dimension-card"
              style={{ ["--dim-color" as string]: d.color }}
            >
              <div className="dimension-glow" aria-hidden="true" />
              <h2 className="dimension-name">{d.name}</h2>
              <div className="dimension-meta">
                <span><strong>Regente:</strong> {d.ruler}</span>
                <span><strong>Acesso:</strong> {d.access}</span>
              </div>
              <p className="dimension-summary">{d.description}</p>
              <div className="lore-event-pokemons">
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
    <span className="lore-pokemon-chip-wrap">
      <Link to={`/pokemon/${name}`} className="lore-pokemon-chip" title={name}>
        {sprite ? (
          <img src={sprite} alt={name} />
        ) : (
          <span className="lore-pokemon-placeholder">?</span>
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
