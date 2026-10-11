import { useState } from "react";
import { Link } from "react-router-dom";
import { useEncounters } from "../hooks/usePokemon";
import {
  conditionLabel,
  encounterVersions,
  encountersFor,
  methodLabel,
} from "../lib/encounters";
import { versionLabel, versionRegion } from "../data/versions";
import { useT } from "../i18n/lang";

interface Props {
  pokemonId: number;
}

/**
 * Onde encontrar este pokémon, jogo a jogo.
 *
 * Abre no jogo mais recente que a PokéAPI cobre.
 */
const EncounterPanel = ({ pokemonId }: Props) => {
  const { data, isLoading, isError } = useEncounters(pokemonId);
  const [escolhido, setEscolhido] = useState<string | undefined>(undefined);
  const t = useT();

  if (isLoading) return <p className="detail-muted">{t("Carregando…", "Loading…")}</p>;
  if (isError) return <p className="detail-muted">{t("Não foi possível consultar a PokéAPI.", "Couldn't reach the PokéAPI.")}</p>;

  const areas = data ?? [];
  const versoes = encounterVersions(areas);
  if (versoes.length === 0) {
    return (
      <p className="detail-muted">
        {t(
          "Não aparece na natureza em nenhum jogo que a PokéAPI cobre — costuma ser inicial, evolução ou evento.",
          "Not found in the wild in any game the PokéAPI covers — usually a starter, an evolution or an event."
        )}
      </p>
    );
  }

  const versao = escolhido && versoes.includes(escolhido) ? escolhido : versoes[versoes.length - 1];
  const linhas = encountersFor(areas, versao);
  const regiao = versionRegion(versao);

  return (
    <div className="encounters">
      <div className="type-filter encounters-jogo">
        <label htmlFor="encounters-select">{t("Jogo", "Game")}</label>
        <select
          id="encounters-select"
          value={versao}
          onChange={(e) => setEscolhido(e.target.value)}
        >
          {versoes.map((v) => (
            <option key={v} value={v}>
              {versionLabel(v)}
            </option>
          ))}
        </select>
        {regiao && (
          <Link to={`/mapa?region=${regiao}`} className="encounters-mapa">
            {t("ver no mapa →", "see on the map →")}
          </Link>
        )}
      </div>
      <table className="encounters-tabela">
        <thead>
          <tr>
            <th scope="col">{t("Onde", "Where")}</th>
            <th scope="col">{t("Como", "How")}</th>
            <th scope="col">{t("Nível", "Level")}</th>
            <th scope="col">{t("Chance", "Chance")}</th>
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
                    ({r.conditions.map((c) => conditionLabel(c)).join(", ")})
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
