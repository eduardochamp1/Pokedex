import { useMemo, useState } from "react";
import CardHero from "../components/CardHero";
import TypeMatchup from "../components/TypeMatchup";
import { usePokemonDetail, usePokemonIndex } from "../hooks/usePokemon";
import { useDebounce } from "../hooks/useDebounce";
import type { Pokemon } from "../types/pokemon";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atq",
  defense: "Def",
  "special-attack": "Atq Esp",
  "special-defense": "Def Esp",
  speed: "Vel",
};

const totalOf = (p: Pokemon) => p.stats.reduce((s, x) => s + x.base_stat, 0);

const ComparePage = () => {
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
    if (!term) return "Digite um nome ou id.";
    if (query.isLoading) return "Carregando…";
    if (query.isError) return "Não foi possível consultar a PokéAPI.";
    if (query.isSuccess && !query.data) return `Nada encontrado para "${term}".`;
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
          aria-label="Selecionar pokémon 1"
          list="compare-names"
        />
        <button
          type="button"
          className="compare-swap"
          onClick={swap}
          aria-label="Trocar posições"
        >
          ⇄
        </button>
        <input
          value={right}
          onChange={(e) => setRight(e.target.value)}
          placeholder="Pokémon 2"
          aria-label="Selecionar pokémon 2"
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
            <h2>Status base</h2>
            <ul className="compare-stats">
              {both[0].stats.map((s, i) => {
                const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
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
            <h2>Efetividade</h2>
            <div className="matchup-grid">
              <div>
                <h3 className="matchup-title">{both[0].name} ataca</h3>
                <TypeMatchup
                  attacker={both[0].types.map((t) => t.type.name)}
                  defender={both[1].types.map((t) => t.type.name)}
                  side="left"
                />
              </div>
              <div>
                <h3 className="matchup-title">{both[1].name} ataca</h3>
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
