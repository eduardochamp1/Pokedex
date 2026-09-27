import { useState } from "react";
import { BALLS, STATUSES, ballMultiplier, catchChance, type Status } from "../lib/capture";
import { calcGen3Stat } from "../lib/gen3Stats";
import { dexMarkOf, usePlayerDex } from "../lib/playerDex";

interface Props {
  national: number;
  captureRate: number;
  baseHp: number;
  types: string[];
}

/** IV médio: o HP real do pokémon selvagem não é conhecido antes da batalha. */
const IV_MEDIO = 15;

const pct = (p: number) =>
  p >= 1 ? "100%" : p <= 0 ? "0%" : p < 0.001 ? "<0,1%" : `${(p * 100).toFixed(1).replace(".", ",")}%`;

/** Média de bolas até capturar, 1/p. Uma casa decimal abaixo de 10: 1,3 não é 2. */
const bolasEsperadas = (p: number) => {
  if (p <= 0) return "—";
  if (p >= 1) return "1";
  const n = 1 / p;
  return `≈ ${n < 10 ? n.toFixed(1).replace(".", ",") : Math.round(n)}`;
};

/**
 * A chance de captura de cada bola, com as regras de Gen 3 (as de Emerald).
 *
 * A Repeat Ball olha a sua dex: se o save diz que você já capturou esta
 * espécie, ela vale ×3.
 */
const CapturePanel = ({ national, captureRate, baseHp, types }: Props) => {
  const [level, setLevel] = useState(20);
  const [hpPct, setHpPct] = useState(100);
  const [umPs, setUmPs] = useState(false);
  const [status, setStatus] = useState<Status>("none");
  const [turn, setTurn] = useState(1);

  const dex = usePlayerDex();
  const owned = dexMarkOf(dex, national) === "owned";

  const maxHp = calcGen3Stat("hp", baseHp, IV_MEDIO, 0, level, 0, national);
  const hp = umPs ? 1 : Math.max(1, Math.round((maxHp * hpPct) / 100));

  return (
    <div className="capture">
      <p className="detail-muted">
        Taxa de captura <strong>{captureRate}</strong> · regras de Gen 3 (Emerald)
      </p>

      <div className="capture-campos">
        <label>
          Nível
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) => setLevel(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Turno
          <input
            type="number"
            min={1}
            max={99}
            value={turn}
            onChange={(e) => setTurn(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
          />
        </label>
        <label className="capture-hp">
          HP {umPs ? "1" : hp}/{maxHp}
          <input
            type="range"
            min={1}
            max={100}
            value={hpPct}
            disabled={umPs}
            onChange={(e) => setHpPct(Number(e.target.value))}
            aria-label="HP restante, em porcentagem"
          />
        </label>
        <label className="capture-check">
          <input type="checkbox" checked={umPs} onChange={(e) => setUmPs(e.target.checked)} />
          1 PS (False Swipe)
        </label>
      </div>

      <table className="capture-tabela">
        <thead>
          <tr>
            <th scope="col">Bola</th>
            <th scope="col">Chance</th>
            <th scope="col">Bolas</th>
          </tr>
        </thead>
        <tbody>
          {BALLS.map((b) => {
            const mult = ballMultiplier(b.id, { types, level, owned, turn });
            const p = catchChance({ catchRate: captureRate, ball: mult, maxHp, hp, status });
            const nota = b.id === "repeat" ? (owned ? "você já tem — ×3" : "você ainda não tem") : b.note;
            return (
              <tr key={b.id}>
                <th scope="row">
                  {b.label}
                  {nota && <span className="capture-nota">{nota}</span>}
                </th>
                <td>
                  <span className="capture-barra" style={{ width: `${Math.min(1, p) * 100}%` }} />
                  <span className="capture-valor">{pct(p)}</span>
                </td>
                <td>{bolasEsperadas(p)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="detail-muted capture-rodape">
        HP calculado com IV {IV_MEDIO} e sem EV. "Bolas" é quantas, em média, até capturar.
      </p>
    </div>
  );
};

export default CapturePanel;
