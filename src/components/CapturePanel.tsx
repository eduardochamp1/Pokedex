import { useState } from "react";
import { BALLS, STATUSES, ballMultiplier, catchChance, type Status } from "../lib/capture";
import { calcGen3Stat } from "../lib/gen3Stats";
import { useLang, tr } from "../i18n/lang";

interface Props {
  national: number;
  captureRate: number;
  baseHp: number;
  types: string[];
}

/** IV médio: o HP real do pokémon selvagem não é conhecido antes da batalha. */
const IV_MEDIO = 15;

/** Vírgula decimal em português, ponto em inglês. */
const decimal = (n: number, casas: number, en: boolean) => {
  const s = n.toFixed(casas);
  return en ? s : s.replace(".", ",");
};

const pct = (p: number, en: boolean) =>
  p >= 1 ? "100%" : p <= 0 ? "0%" : p < 0.001 ? `<${decimal(0.1, 1, en)}%` : `${decimal(p * 100, 1, en)}%`;

/** Média de bolas até capturar, 1/p. Uma casa decimal abaixo de 10: 1,3 não é 2. */
const bolasEsperadas = (p: number, en: boolean) => {
  if (p <= 0) return "—";
  if (p >= 1) return "1";
  const n = 1 / p;
  return `≈ ${n < 10 ? decimal(n, 1, en) : Math.round(n)}`;
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
  const lang = useLang();
  const en = lang === "en";
  const t = (pt: string, enText: string) => tr(lang, pt, enText);

  // A Repeat Ball rende ×3 em espécie já capturada, e só quem joga sabe disso.
  const [owned, setOwned] = useState(false);

  const maxHp = calcGen3Stat("hp", baseHp, IV_MEDIO, 0, level, 0, national);
  const hp = umPs ? 1 : Math.max(1, Math.round((maxHp * hpPct) / 100));

  return (
    <div className="capture">
      <p className="detail-muted">
        {t("Taxa de captura", "Catch rate")} <strong>{captureRate}</strong> ·{" "}
        {t("regras de Gen 3 (Emerald)", "Gen 3 rules (Emerald)")}
      </p>

      <div className="capture-campos">
        <label>
          {t("Nível", "Level")}
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) => setLevel(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
          />
        </label>
        <label>
          {t("Status", "Status")}
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {en ? s.labelEn : s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Turno", "Turn")}
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
            aria-label={t("HP restante, em porcentagem", "Remaining HP, in percent")}
          />
        </label>
        <label className="capture-check">
          <input type="checkbox" checked={umPs} onChange={(e) => setUmPs(e.target.checked)} />
          {t("1 PS (False Swipe)", "1 HP (False Swipe)")}
        </label>
        <label className="capture-check">
          <input type="checkbox" checked={owned} onChange={(e) => setOwned(e.target.checked)} />
          {t("Já capturei um", "I already caught one")}
        </label>
      </div>

      <table className="capture-tabela">
        <thead>
          <tr>
            <th scope="col">{t("Bola", "Ball")}</th>
            <th scope="col">{t("Chance", "Chance")}</th>
            <th scope="col">{t("Bolas", "Balls")}</th>
          </tr>
        </thead>
        <tbody>
          {BALLS.map((b) => {
            const mult = ballMultiplier(b.id, { types, level, owned, turn });
            const p = catchChance({ catchRate: captureRate, ball: mult, maxHp, hp, status });
            const nota =
              b.id === "repeat"
                ? owned
                  ? t("você já tem — ×3", "you already have it — ×3")
                  : t("você ainda não tem", "you don't have it yet")
                : b.note && t(...b.note);
            return (
              <tr key={b.id}>
                <th scope="row">
                  {b.label}
                  {nota && <span className="capture-nota">{nota}</span>}
                </th>
                <td>
                  <span className="capture-barra" style={{ width: `${Math.min(1, p) * 100}%` }} />
                  <span className="capture-valor">{pct(p, en)}</span>
                </td>
                <td>{bolasEsperadas(p, en)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="detail-muted capture-rodape">
        {t(
          `HP calculado com IV ${IV_MEDIO} e sem EV. "Bolas" é quantas, em média, até capturar.`,
          `HP computed with IV ${IV_MEDIO} and no EVs. "Balls" is how many, on average, until the catch.`
        )}
      </p>
    </div>
  );
};

export default CapturePanel;
