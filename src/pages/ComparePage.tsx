import { useState } from "react";
import { Link } from "react-router-dom";
import { usePokemonDetail } from "../hooks/usePokemon";
import { useDebounce } from "../hooks/useDebounce";
import type { Pokemon } from "../types/pokemon";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Atq. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidade",
};

interface SlotProps {
  index: 0 | 1;
  value: string;
  onChange: (v: string) => void;
  data: Pokemon | null | undefined;
  isLoading: boolean;
}

const Slot = ({ index, value, onChange, data, isLoading }: SlotProps) => {
  return (
    <div className="compare-slot">
      <input
        type="search"
        className="compare-input"
        value={value}
        placeholder={`Pokémon ${index + 1} (nome ou id)`}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Selecionar pokémon ${index + 1}`}
      />
      {isLoading && <div className="compare-loading">Carregando…</div>}
      {!isLoading && data && (
        <div
          className="compare-card"
          data-primary-type={data.types[0]?.type.name}
        >
          <img
            src={
              data.sprites.other?.["official-artwork"]?.front_default ??
              data.sprites.front_default ??
              ""
            }
            alt={data.name}
            className="compare-image"
          />
          <div className="compare-name">
            <Link to={`/pokemon/${data.name}`}>{data.name}</Link>
            <span className="compare-id">#{String(data.id).padStart(3, "0")}</span>
          </div>
          <div className="pokemon-type">
            {data.types.map((t) => (
              <span
                key={t.type.name}
                className="pokemon-type-text"
                data-type={t.type.name}
              >
                {t.type.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {!isLoading && value && data === null && (
        <div className="compare-empty">Não encontrado.</div>
      )}
    </div>
  );
};

const ComparePage = () => {
  const [left, setLeft] = useState("bulbasaur");
  const [right, setRight] = useState("charmander");

  const leftDeb = useDebounce(left.trim(), 350);
  const rightDeb = useDebounce(right.trim(), 350);

  const leftQ = usePokemonDetail(leftDeb || undefined);
  const rightQ = usePokemonDetail(rightDeb || undefined);

  const both = leftQ.data && rightQ.data ? [leftQ.data, rightQ.data] : null;

  return (
    <div className="compare-container">
      <h1 className="compare-title">Comparar</h1>
      <div className="compare-grid">
        <Slot
          index={0}
          value={left}
          onChange={setLeft}
          data={leftQ.data}
          isLoading={leftQ.isFetching}
        />
        <Slot
          index={1}
          value={right}
          onChange={setRight}
          data={rightQ.data}
          isLoading={rightQ.isFetching}
        />
      </div>

      {both && (
        <section className="detail-section">
          <h2>Status base</h2>
          <ul className="compare-stats">
            {both[0].stats.map((s, i) => {
              const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
              const leftVal = s.base_stat;
              const rightVal = both[1].stats[i]?.base_stat ?? 0;
              const max = Math.max(leftVal, rightVal, 1);
              const leftPct = (leftVal / max) * 100;
              const rightPct = (rightVal / max) * 100;
              const leftWins = leftVal > rightVal;
              const rightWins = rightVal > leftVal;
              return (
                <li key={s.stat.name} className="compare-stat">
                  <span
                    className={
                      "compare-stat-value left" +
                      (leftWins ? " winner" : rightWins ? " loser" : "")
                    }
                  >
                    {leftVal}
                  </span>
                  <span className="compare-stat-bar-wrap">
                    <span className="compare-stat-bar left">
                      <span
                        className="compare-stat-bar-fill left"
                        style={{ width: `${leftPct}%` }}
                      />
                    </span>
                    <span className="compare-stat-label">{label}</span>
                    <span className="compare-stat-bar right">
                      <span
                        className="compare-stat-bar-fill right"
                        style={{ width: `${rightPct}%` }}
                      />
                    </span>
                  </span>
                  <span
                    className={
                      "compare-stat-value right" +
                      (rightWins ? " winner" : leftWins ? " loser" : "")
                    }
                  >
                    {rightVal}
                  </span>
                </li>
              );
            })}
            <li className="compare-stat compare-total">
              <span
                className={
                  "compare-stat-value left" +
                  (totalOf(both[0]) > totalOf(both[1])
                    ? " winner"
                    : totalOf(both[0]) < totalOf(both[1])
                    ? " loser"
                    : "")
                }
              >
                {totalOf(both[0])}
              </span>
              <span className="compare-stat-bar-wrap">
                <span className="compare-stat-label compare-total-label">Total</span>
              </span>
              <span
                className={
                  "compare-stat-value right" +
                  (totalOf(both[1]) > totalOf(both[0])
                    ? " winner"
                    : totalOf(both[1]) < totalOf(both[0])
                    ? " loser"
                    : "")
                }
              >
                {totalOf(both[1])}
              </span>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
};

const totalOf = (p: Pokemon) => p.stats.reduce((sum, s) => sum + s.base_stat, 0);

export default ComparePage;
