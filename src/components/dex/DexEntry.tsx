import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import FavoriteContext from "../../contexts/favoritesContext";
import {
  POKEMON_TYPES,
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
  type EvolutionStep,
} from "../../hooks/usePokemon";
import { searchPokemon } from "../../api";
import { attackMultiplier, type TypeName } from "../../data/typeMatchups";
import { LEGENDARY, MYTHICAL } from "../../data/rarity";
import { tGenus, tType } from "../../data/i18n";
import { evolutionConditionText } from "../../lib/evolution";
import { pickLocalized } from "../../lib/localize";
import { multiplierLabel } from "../../lib/typeDefense";
import { pixelSpriteUrl } from "../../lib/sprites";
import { pokemonLabel } from "../../lib/pokemonLabel";
import { statLabel } from "../../i18n/common";
import { useLang, tr, type Lang } from "../../i18n/lang";
import AbilityList from "../AbilityList";
import CapturePanel from "../CapturePanel";
import CryButton from "../CryButton";
import EncounterPanel from "../EncounterPanel";
import MoveList from "../MoveList";
import PokemonLore from "../PokemonLore";
import PokemonMeta from "../PokemonMeta";
import SpriteScrubber from "../SpriteScrubber";
import SpriteViewer from "../SpriteViewer";
import VarietySwitcher from "../VarietySwitcher";
import type { Pokemon } from "../../types/pokemon";
import "../../styles/detailExtras.css";

const TABS = [
  { id: "sobre", pt: "SOBRE", en: "ABOUT" },
  { id: "status", pt: "STATUS", en: "STATS" },
  { id: "evol", pt: "EVOL.", en: "EVOL." },
  { id: "golpes", pt: "GOLPES", en: "MOVES" },
  { id: "local", pt: "LOCAL", en: "WHERE" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

/** Cor da barra de status: forte, médio, fraco — lê-se também pelo número. */
function statTone(v: number): string {
  if (v >= 100) return "var(--accent)";
  if (v >= 60) return "var(--accent-alt)";
  return "var(--fav)";
}

function defenseTone(m: number): string {
  if (m === 0) return "is-immune";
  if (m >= 4) return "is-x4";
  if (m > 1) return "is-x2";
  if (m < 1) return "is-resist";
  return "";
}

const Evolution = ({ steps, currentName, search, lang }: { steps: EvolutionStep[]; currentName: string; search: string; lang: Lang }) => {
  const queries = useQueries({
    queries: steps.map((s) => ({
      queryKey: ["pokemon-detail", s.name.toLowerCase()],
      queryFn: ({ signal }: { signal?: AbortSignal }) => searchPokemon(s.name, signal),
      staleTime: 30 * 60 * 1000,
    })),
  });

  if (steps.length <= 1) {
    return <p className="pane-empty">{tr(lang, "ESTE POKEMON NAO EVOLUI", "THIS POKEMON DOES NOT EVOLVE")}</p>;
  }

  return (
    <ol className="entry-evo">
      {steps.map((step, i) => {
        const data = queries[i]?.data as Pokemon | null | undefined;
        const atual = step.name.toLowerCase() === currentName.toLowerCase();
        const condicao = evolutionConditionText(step.detail);
        return (
          <li key={step.name} className="entry-evo-step">
            {i > 0 && (
              <span className="entry-evo-cond px">
                {condicao ? semAcento(condicao) : ""} →
              </span>
            )}
            <Link
              to={{ pathname: `/pokemon/${step.name}`, search }}
              className="pane-row entry-evo-card"
              aria-current={atual ? "true" : undefined}
            >
              <img className="pixelated" src={data ? pixelSpriteUrl(data.id) : undefined} width={72} height={72} alt="" />
              <span>{pokemonLabel(step.name, lang)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

interface Props {
  nameOrId: string | undefined;
  /** Sem seleção, a ficha mostra o pokémon do dia e avisa disso. */
  featured?: boolean;
  /** Query string atual, para os links internos não perderem os filtros. */
  search: string;
}

/**
 * A tela da direita da Pokédex: a ficha.
 */
const DexEntry = ({ nameOrId, featured = false, search }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [params, setParams] = useSearchParams();
  const { data: pokemon, isLoading, isError } = usePokemonDetail(nameOrId);
  const species = usePokemonSpecies(pokemon?.species.url);
  const evolution = useEvolutionChain(pokemon?.species.url);
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const [spriteOverride, setSpriteOverride] = useState<string | undefined>();
  useEffect(() => setSpriteOverride(undefined), [pokemon?.id]);

  const abaRaw = params.get("aba");
  const aba: TabId = TABS.some((x) => x.id === abaRaw) ? (abaRaw as TabId) : "sobre";
  const setAba = (id: TabId) => {
    const next = new URLSearchParams(params);
    if (id === "sobre") next.delete("aba");
    else next.set("aba", id);
    setParams(next, { replace: true });
  };

  if (!nameOrId || (isLoading && !pokemon)) {
    return <p className="pane-empty">{t("CARREGANDO FICHA…", "LOADING ENTRY…")}</p>;
  }
  if (isError) {
    return (
      <p className="pane-empty">
        {t("NAO FOI POSSIVEL CARREGAR", "COULD NOT LOAD")}
        <br />
        {t("ESTE POKEMON", "THIS POKEMON")}
      </p>
    );
  }
  if (!pokemon) {
    return <p className="pane-empty">{t("POKEMON NAO ENCONTRADO", "POKEMON NOT FOUND")}</p>;
  }

  const isFav = favoritePokemons.includes(pokemon.name);
  const tipos = pokemon.types.map((x) => x.type.name);
  const total = pokemon.stats.reduce((s, x) => s + x.base_stat, 0);
  const genus = pickLocalized(species.data?.genera, (g) => g.genus);
  const flavor = pickLocalized(species.data?.flavor_text_entries, (e) => e.flavor_text);
  const raridade = MYTHICAL.includes(pokemon.name)
    ? t("✦ MITICO", "✦ MYTHICAL")
    : LEGENDARY.includes(pokemon.name)
      ? t("★ LENDARIO", "★ LEGENDARY")
      : "";
  const nome = pokemonLabel(pokemon.name, lang);

  return (
    <>
      <header className="pane-band entry-band">
        <div className="entry-band-top px">
          <span>
            NO. {String(pokemon.id).padStart(4, "0")}
            {featured && <span className="entry-daily"> · {t("POKEMON DO DIA", "POKEMON OF THE DAY")}</span>}
          </span>
          <span>{raridade}</span>
          <span className="entry-actions">
            <CryButton src={pokemon.cries?.latest} name={pokemon.name} />
            <button
              type="button"
              className="entry-fav"
              aria-pressed={isFav}
              aria-label={
                isFav
                  ? t(`Remover ${nome} dos favoritos`, `Remove ${nome} from favorites`)
                  : t(`Favoritar ${nome}`, `Add ${nome} to favorites`)
              }
              onClick={() => updateFavoritePokemons(pokemon.name)}
            >
              {isFav ? "♥" : "♡"}
            </button>
          </span>
        </div>
        <div className="entry-band-main">
          <div className="entry-sprite">
            <img
              className="pixelated"
              src={spriteOverride ?? pixelSpriteUrl(pokemon.id)}
              width={128}
              height={128}
              alt={nome}
            />
          </div>
          <div className="entry-id">
            {genus && <div className="px">{semAcento(tGenus(genus, lang))}</div>}
            <h1>{nome}</h1>
            <div className="entry-types">
              {tipos.map((tp) => (
                <span key={tp} className="type-tag" style={{ background: `var(--t-${tp})` }}>
                  {semAcento(tType(tp, lang))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="entry-tabs" role="tablist" aria-label={t("Seções da ficha", "Entry sections")}>
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`entry-tab-${x.id}`}
            aria-selected={aba === x.id}
            aria-controls="entry-panel"
            onClick={() => setAba(x.id)}
          >
            {lang === "en" ? x.en : x.pt}
          </button>
        ))}
      </div>

      <div className="pane-scroll pane-scroll-loose" role="tabpanel" id="entry-panel" aria-labelledby={`entry-tab-${aba}`}>
        {aba === "sobre" && (
          <>
            {flavor && <blockquote className="entry-flavor">{flavor}</blockquote>}
            <div className="entry-facts">
              <div className="pane-card">
                <span className="pane-h">{t("ALTURA", "HEIGHT")}</span>
                <strong>{(pokemon.height / 10).toFixed(1)} m</strong>
              </div>
              <div className="pane-card">
                <span className="pane-h">{t("PESO", "WEIGHT")}</span>
                <strong>{(pokemon.weight / 10).toFixed(1)} kg</strong>
              </div>
              <div className="pane-card">
                <span className="pane-h">{t("CAPTURA", "CATCH RATE")}</span>
                <strong>{species.data?.capture_rate ?? "—"}</strong>
              </div>
            </div>
            <section className="entry-section">
              <h2 className="pane-h">{t("HABILIDADES", "ABILITIES")}</h2>
              <AbilityList abilities={pokemon.abilities} />
            </section>
            <section className="entry-section">
              <h2 className="pane-h">{t("FICHA", "PROFILE")}</h2>
              <PokemonMeta pokemon={pokemon} species={species.data} />
            </section>
            {species.data && species.data.varieties.length > 1 && (
              <section className="entry-section">
                <h2 className="pane-h">{t("FORMAS", "FORMS")}</h2>
                <VarietySwitcher varieties={species.data.varieties} currentName={pokemon.name} />
              </section>
            )}
            <section className="entry-section">
              <h2 className="pane-h">SPRITES</h2>
              <SpriteViewer pokemon={pokemon} onSelect={setSpriteOverride} />
            </section>
            <section className="entry-section">
              <h2 className="pane-h">{t("SPRITE ATRAVES DAS GERACOES", "SPRITE ACROSS GENERATIONS")}</h2>
              <SpriteScrubber pokemon={pokemon} />
            </section>
          </>
        )}

        {aba === "status" && (
          <>
            <ul className="entry-stats">
              {pokemon.stats.map((s) => (
                <li key={s.stat.name}>
                  <span className="px">{semAcento(statLabel(s.stat.name, lang))}</span>
                  <span className="entry-stat-bar">
                    <span
                      style={{
                        width: `${Math.min(100, (s.base_stat / 180) * 100)}%`,
                        background: statTone(s.base_stat),
                      }}
                    />
                  </span>
                  <strong>{s.base_stat}</strong>
                </li>
              ))}
              <li className="entry-stat-total">
                <span className="px">TOTAL</span>
                <span />
                <strong>{total}</strong>
              </li>
            </ul>
            <section className="entry-section">
              <h2 className="pane-h">{t("DEFESAS", "DEFENSES")}</h2>
              <ul className="entry-defense">
                {POKEMON_TYPES.map((atk) => {
                  const m = attackMultiplier(atk as TypeName, tipos as TypeName[]);
                  return (
                    <li key={atk} className={defenseTone(m)} title={`${tType(atk, lang)} ${multiplierLabel(m)}`}>
                      <span className="entry-defense-type" style={{ background: `var(--t-${atk})` }}>
                        {semAcento(tType(atk, lang)).slice(0, 3)}
                      </span>
                      <span className="entry-defense-mult">{m === 1 ? "" : multiplierLabel(m)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {aba === "evol" &&
          (evolution.isLoading ? (
            <p className="pane-empty">{t("CARREGANDO…", "LOADING…")}</p>
          ) : (
            <Evolution steps={evolution.data ?? []} currentName={pokemon.name} search={search} lang={lang} />
          ))}

        {aba === "golpes" && <MoveList moves={pokemon.moves ?? []} />}

        {aba === "local" && (
          <>
            <section className="entry-section">
              <h2 className="pane-h">{t("ONDE ENCONTRAR", "WHERE TO FIND")}</h2>
              <EncounterPanel pokemonId={pokemon.id} />
            </section>
            {species.data && (
              <section className="entry-section">
                <h2 className="pane-h">{t("CHANCE DE CAPTURA", "CATCH CHANCE")}</h2>
                <CapturePanel
                  national={pokemon.id}
                  captureRate={species.data.capture_rate}
                  baseHp={pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 1}
                  types={tipos}
                />
              </section>
            )}
            {species.data && (
              <section className="entry-section">
                <h2 className="pane-h">{t("NA LORE", "IN THE LORE")}</h2>
                <PokemonLore species={species.data} />
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default DexEntry;
