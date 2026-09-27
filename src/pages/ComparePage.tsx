import { useMemo, useState } from "react";
import CardHero from "../components/CardHero";
import TypeMatchup from "../components/TypeMatchup";
import { usePokemonDetail, usePokemonIndex } from "../hooks/usePokemon";
import { useDebounce } from "../hooks/useDebounce";
import type { Pokemon } from "../types/pokemon";
import { useLang, tr } from "../i18n/lang";
import { statLabel } from "../i18n/common";

const totalOf = (p: Pokemon) => p.stats.reduce((s, x) => s + x.base_stat, 0);

const ComparePage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [left, setLeft] = useState("bulbasaur");
  const [right, setRight] = useState("charmander");
  const leftDeb = useDebounce(left.trim(), 350);
  const rightDeb = useDebounce(right.trim(), 350);
  const leftQ = usePokemonDetail(leftDeb || undefined);
  const rightQ = usePokemonDetail(rightDeb || undefined);
  const both = leftQ.data && rightQ.data ? ([leftQ.data, rightQ.data] as const) : null;
  const { index } = usePokemonIndex();
  const suggestions = useMemo(
    () => (index ? [...index.keys()] : []),
    [index]
  );

  const slotStatus = (
    query: typeof leftQ,
    term: string
  ): string | null => {
    if (!term) return t("Digite um nome ou id.", "Type a name or number.");
    if (query.isLoading) return t("Carregando…", "Loading…");
    if (query.isError) return t("Não foi possível consultar a PokéAPI.", "Couldn't reach the PokéAPI.");
    if (query.isSuccess && !query.data) return t(`Nada encontrado para "${term}".`, `Nothing found for "${term}".`);
    return null;
  };
  const leftStatus = slotStatus(leftQ, leftDeb);
  const rightStatus = slotStatus(rightQ, rightDeb);

  const swap = () => {
    setLeft(right);
    setRight(left);
  };

  return (
    <div className="compare-shell">
      <h1 className="compare-title">Arena</h1>

      <div className="compare-inputs">
        <input
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          placeholder="Pokémon 1"
          aria-label={t("Selecionar pokémon 1", "Choose Pokémon 1")}
          list="compare-names"
        />
        <button
          type="button"
          className="compare-swap"
          onClick={swap}
          aria-label={t("Trocar posições", "Swap sides")}
        >
          ⇄
        </button>
        <input
          value={right}
          onChange={(e) => setRight(e.target.value)}
          placeholder="Pokémon 2"
          aria-label={t("Selecionar pokémon 2", "Choose Pokémon 2")}
          list="compare-names"
        />
        <datalist id="compare-names">
          {suggestions.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      <div className="compare-arena">
        <div className="compare-slot">
          {leftQ.data ? (
            <CardHero pokemon={leftQ.data} />
          ) : (
            <p className="compare-slot-status">{leftStatus}</p>
          )}
        </div>
        <div className="compare-slot">
          {rightQ.data ? (
            <CardHero pokemon={rightQ.data} />
          ) : (
            <p className="compare-slot-status">{rightStatus}</p>
          )}
        </div>
      </div>

      {both && (
        <>
          <section className="compare-section">
            <h2>{t("Status base", "Base stats")}</h2>
            <ul className="compare-stats">
              {both[0].stats.map((s, i) => {
                const label = statLabel(s.stat.name, lang);
                const lv = s.base_stat;
                const rv = both[1].stats[i]?.base_stat ?? 0;
                const max = Math.max(lv, rv, 1);
                return (
                  <li key={s.stat.name}>
                    <span
                      className={
                        "compare-value left" + (lv > rv ? " winner" : "")
                      }
                    >
                      {lv}
                    </span>
                    <span className="compare-bar-wrap">
                      <span className="compare-bar left">
                        <span style={{ width: `${(lv / max) * 100}%` }} />
                      </span>
                      <span className="compare-label">{label}</span>
                      <span className="compare-bar right">
                        <span style={{ width: `${(rv / max) * 100}%` }} />
                      </span>
                    </span>
                    <span
                      className={
                        "compare-value right" + (rv > lv ? " winner" : "")
                      }
                    >
                      {rv}
                    </span>
                  </li>
                );
              })}
              <li className="compare-total-row">
                <span
                  className={
                    "compare-value left" +
                    (totalOf(both[0]) > totalOf(both[1]) ? " winner" : "")
                  }
                >
                  {totalOf(both[0])}
                </span>
                <span className="compare-bar-wrap">
                  <span className="compare-label compare-total-label">TOTAL</span>
                </span>
                <span
                  className={
                    "compare-value right" +
                    (totalOf(both[1]) > totalOf(both[0]) ? " winner" : "")
                  }
                >
                  {totalOf(both[1])}
                </span>
              </li>
            </ul>
          </section>

          <section className="compare-section">
            <h2>{t("Efetividade", "Effectiveness")}</h2>
            <div className="matchup-grid">
              <div>
                <h3 className="matchup-title">
                  {both[0].name} {t("ataca", "attacks")}
                </h3>
                <TypeMatchup
                  attacker={both[0].types.map((t) => t.type.name)}
                  defender={both[1].types.map((t) => t.type.name)}
                  side="left"
                />
              </div>
              <div>
                <h3 className="matchup-title">
                  {both[1].name} {t("ataca", "attacks")}
                </h3>
                <TypeMatchup
                  attacker={both[1].types.map((t) => t.type.name)}
                  defender={both[0].types.map((t) => t.type.name)}
                  side="right"
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ComparePage;
