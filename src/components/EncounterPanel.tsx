import { useState } from "react";
import { Link } from "react-router-dom";
import { useEncounters } from "../hooks/usePokemon";
import { useTrainerEntry } from "../lib/trainerLog";
import {
  conditionLabel,
  encounterVersions,
  encountersFor,
  methodLabel,
} from "../lib/encounters";
import { versionLabel, versionRegion } from "../data/versions";

interface Props {
  pokemonId: number;
}

/**
 * Onde encontrar este pokémon, jogo a jogo.
 *
 * Abre no jogo que o save diz que você está jogando (Emerald, hoje o único
 * lido), quando este pokémon aparece nele; senão, no mais recente que a
 * PokéAPI cobre.
 */
const EncounterPanel = ({ pokemonId }: Props) => {
  const { data, isLoading, isError } = useEncounters(pokemonId);
  const treinador = useTrainerEntry();
  const [escolhido, setEscolhido] = useState<string | undefined>(undefined);

  if (isLoading) return <p className="detail-muted">Carregando…</p>;
  if (isError) return <p className="detail-muted">Não foi possível consultar a PokéAPI.</p>;

  const areas = data ?? [];
  const versoes = encounterVersions(areas);
  if (versoes.length === 0) {
    return (
      <p className="detail-muted">
        Não aparece na natureza em nenhum jogo que a PokéAPI cobre — costuma ser
        inicial, evolução ou evento.
      </p>
    );
  }

  const doSave = treinador && versoes.includes("emerald") ? "emerald" : undefined;
  const versao = escolhido && versoes.includes(escolhido) ? escolhido : doSave ?? versoes[versoes.length - 1];
  const linhas = encountersFor(areas, versao);
  const regiao = versionRegion(versao);

  return (
    <div className="encounters">
      <div className="type-filter encounters-jogo">
        <label htmlFor="encounters-select">Jogo</label>
        <select
          id="encounters-select"
          value={versao}
          onChange={(e) => setEscolhido(e.target.value)}
        >
          {versoes.map((v) => (
            <option key={v} value={v}>
              {versionLabel(v)}
              {v === doSave ? " — seu jogo" : ""}
            </option>
          ))}
        </select>
        {regiao && (
          <Link to={`/mapa?region=${regiao}`} className="encounters-mapa">
            ver no mapa →
          </Link>
        )}
      </div>
      <table className="encounters-tabela">
        <thead>
          <tr>
            <th scope="col">Onde</th>
            <th scope="col">Como</th>
            <th scope="col">Nível</th>
            <th scope="col">Chance</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((r, i) => (
            <tr key={i}>
              <th scope="row">
                {r.area}
                {r.conditions.length > 0 && (
                  <span className="encounters-cond">
                    {" "}
                    ({r.conditions.map(conditionLabel).join(", ")})
                  </span>
                )}
              </th>
              <td>{methodLabel(r.method)}</td>
              <td>{r.minLevel === r.maxLevel ? r.minLevel : `${r.minLevel}–${r.maxLevel}`}</td>
              <td>{r.chance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EncounterPanel;
