import { Link } from "react-router-dom";
import {
  DEX_FILTERS,
  TOTAL_DA_DEX_GEN3,
  type DexFilter,
  type PlayerDexEntry,
} from "../lib/playerDex";

interface Props {
  entry: PlayerDexEntry;
  value: DexFilter | undefined;
  onChange: (v: DexFilter | undefined) => void;
}

/** Nome do arquivo sem a extensão, que é como a Home já mostra o jogo. */
const semExtensao = (rom: string) => rom.replace(/\.[^.]+$/, "");

/**
 * O progresso do jogo lido do save, e o recorte da grade por ele.
 *
 * Só aparece quando há uma dex gravada — quem nunca abriu um jogo de Gen 3 em
 * /jogar não vê um filtro que não teria o que filtrar.
 */
const PlayerDexFilter = ({ entry, value, onChange }: Props) => {
  const capturados = entry.owned.length;
  const vistos = entry.seen.length;

  return (
    <div className="player-dex">
      <p className="player-dex-jogo">
        <Link to="/treinador" className="player-dex-treinador" title="Ficha do treinador">
          <strong>{entry.playerName || "Você"}</strong>
        </Link>{" "}
        ·{" "}
        <Link to="/jogar">{semExtensao(entry.rom)}</Link>
      </p>
      <div
        className="player-dex-barra"
        role="img"
        aria-label={`${capturados} capturados e ${vistos} vistos de ${TOTAL_DA_DEX_GEN3}`}
      >
        <span
          className="player-dex-vistos"
          style={{ width: `${(vistos / TOTAL_DA_DEX_GEN3) * 100}%` }}
        />
        <span
          className="player-dex-capturados"
          style={{ width: `${(capturados / TOTAL_DA_DEX_GEN3) * 100}%` }}
        />
      </div>
      <p className="player-dex-numeros">
        {capturados} {capturados === 1 ? "capturado" : "capturados"} · {vistos}{" "}
        {vistos === 1 ? "visto" : "vistos"} de {TOTAL_DA_DEX_GEN3}
      </p>
      <div className="type-filter">
        <label htmlFor="player-dex-select">Mostrar:</label>
        <select
          id="player-dex-select"
          value={value ?? ""}
          onChange={(e) => onChange((e.target.value as DexFilter) || undefined)}
        >
          <option value="">Todos</option>
          {DEX_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PlayerDexFilter;
