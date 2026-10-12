import { useState } from "react";
import { Link } from "react-router-dom";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import RosterList from "../components/device/RosterList";
import { usePokemonDetail } from "../hooks/usePokemon";
import { attackMultiplier, type TypeName } from "../data/typeMatchups";
import { tType } from "../data/i18n";
import { pixelSpriteUrl } from "../lib/sprites";
import { pokemonLabel } from "../lib/pokemonLabel";
import type { Pokemon } from "../types/pokemon";
import { useLang, tr, type Lang } from "../i18n/lang";
import { statLabel } from "../i18n/common";
import "../styles/compare.css";

const totalOf = (p: Pokemon) => p.stats.reduce((s, x) => s + x.base_stat, 0);
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

type Slot = "a" | "b";

const Fighter = ({ pokemon, lang }: { pokemon: Pokemon | null | undefined; lang: Lang }) =>
  pokemon ? (
    <Link to={`/pokemon/${pokemon.name}`} className="cmp-fighter">
      <img className="pixelated" src={pixelSpriteUrl(pokemon.id)} width={112} height={112} alt="" />
      <strong>{pokemonLabel(pokemon.name, lang)}</strong>
      <span className="cmp-types">
        {pokemon.types.map((x) => (
          <span key={x.type.name} className="type-tag" data-type={x.type.name} style={{ background: `var(--t-${x.type.name})` }}>
            {semAcento(tType(x.type.name, lang))}
          </span>
        ))}
      </span>
    </Link>
  ) : (
    <span className="cmp-fighter cmp-fighter-vazio px">…</span>
  );

/** Cada tipo do atacante contra o defensor. */
const Effect = ({ atk, def, lang }: { atk: Pokemon; def: Pokemon; lang: Lang }) => (
  <div className="pane-card">
    <span className="pane-card-tag">
      {semAcento(pokemonLabel(atk.name, lang))} {tr(lang, "ATACA", "ATTACKS")}
    </span>
    <ul className="cmp-effect">
      {atk.types.map((x) => {
        const m = attackMultiplier(
          x.type.name as TypeName,
          def.types.map((d) => d.type.name) as TypeName[]
        );
        return (
          <li key={x.type.name}>
            <span className="type-tag" data-type={x.type.name} style={{ background: `var(--t-${x.type.name})` }}>
              {semAcento(tType(x.type.name, lang))}
            </span>
            <strong className={m > 1 ? "is-forte" : m < 1 ? "is-fraco" : ""}>
              {m === 0 ? tr(lang, "sem efeito", "no effect") : `×${m}`}
            </strong>
          </li>
        );
      })}
    </ul>
  </div>
);

/**
 * Comparar: dois pokémon lado a lado.
 *
 * À esquerda o elenco; tocar num pokémon o põe no slot ativo e passa a vez
 * para o outro slot — dois toques montam o duelo.
 */
const ComparePage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [a, setA] = useState("bulbasaur");
  const [b, setB] = useState("charmander");
  const [slot, setSlot] = useState<Slot>("a");
  const aQ = usePokemonDetail(a);
  const bQ = usePokemonDetail(b);
  const both = aQ.data && bQ.data ? ([aQ.data, bQ.data] as const) : null;

  useDevicePage({ labels: [t("ESCOLHER", "PICK"), t("DUELO", "DUEL")] });

  const pick = (name: string) => {
    if (slot === "a") setA(name);
    else setB(name);
    setSlot(slot === "a" ? "b" : "a");
  };
  const swap = () => {
    setA(b);
    setB(a);
  };

  const linhas = both
    ? [
        ...both[0].stats.map((s, i) => ({
          label: semAcento(statLabel(s.stat.name, lang)),
          l: s.base_stat,
          r: both[1].stats[i]?.base_stat ?? 0,
        })),
        { label: "TOTAL", l: totalOf(both[0]), r: totalOf(both[1]) },
      ]
    : [];

  return (
    <Panes
      leftLabel={t("Elenco", "Roster")}
      rightLabel={t("Duelo", "Duel")}
      left={
        <>
          <div className="pane-bar">
            <h1 className="pane-h">ARENA</h1>
            <div className="pane-bar-row">
              <button type="button" className="pane-btn" aria-pressed={slot === "a"} onClick={() => setSlot("a")}>
                SLOT A
              </button>
              <button type="button" className="pane-btn" aria-pressed={slot === "b"} onClick={() => setSlot("b")}>
                SLOT B
              </button>
              <button type="button" className="pane-btn" onClick={swap} aria-label={t("Trocar posições", "Swap sides")}>
                ⇄ {t("TROCAR", "SWAP")}
              </button>
            </div>
          </div>
          <RosterList
            onPick={pick}
            isOn={(n) => n === a || n === b}
            mark={(n) => (
              <>
                {n === a && <span className="cmp-mark">A</span>}
                {n === b && <span className="cmp-mark">B</span>}
              </>
            )}
          />
        </>
      }
      right={
        <>
          <header className="pane-band cmp-band">
            <Fighter pokemon={aQ.data} lang={lang} />
            <span className="cmp-vs px">VS</span>
            <Fighter pokemon={bQ.data} lang={lang} />
          </header>
          <div className="pane-scroll pane-scroll-loose">
            {!both ? (
              <p className="pane-empty">
                {aQ.isError || bQ.isError
                  ? t("SEM SINAL DA POKEAPI", "NO SIGNAL FROM POKEAPI")
                  : t("CARREGANDO…", "LOADING…")}
              </p>
            ) : (
              <>
                <ul className="cmp-stats">
                  {linhas.map((x) => {
                    const max = Math.max(x.l, x.r, 1);
                    return (
                      <li key={x.label} className={x.label === "TOTAL" ? "cmp-total" : undefined}>
                        <strong className={x.l > x.r ? "is-win" : ""}>{x.l}</strong>
                        <span className="cmp-bar cmp-bar-l">
                          <span className={x.l >= x.r ? "is-win" : ""} style={{ width: `${(x.l / max) * 100}%` }} />
                        </span>
                        <span className="px">{x.label}</span>
                        <span className="cmp-bar">
                          <span className={x.r >= x.l ? "is-win" : ""} style={{ width: `${(x.r / max) * 100}%` }} />
                        </span>
                        <strong className={x.r > x.l ? "is-win" : ""}>{x.r}</strong>
                      </li>
                    );
                  })}
                </ul>
                <h2 className="pane-h">{t("EFETIVIDADE", "EFFECTIVENESS")}</h2>
                <div className="cmp-effects">
                  <Effect atk={both[0]} def={both[1]} lang={lang} />
                  <Effect atk={both[1]} def={both[0]} lang={lang} />
                </div>
              </>
            )}
          </div>
        </>
      }
    />
  );
};

export default ComparePage;
