import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMoveDetail } from "../hooks/usePokemon";
import { pickLocalized } from "../lib/localize";
import {
  availableVersionGroups,
  groupByMethod,
  movesForVersionGroup,
  preferredVersionGroup,
  prettyMoveName,
  type LearnedMove,
} from "../lib/moves";
import { versionGroupLabel } from "../data/versionGroups";
import { isPlayable } from "../emulator/playable";
import { tType } from "../data/i18n";
import type { PokemonMove } from "../types/pokemon";
import { useLang, tr } from "../i18n/lang";

interface Props {
  moves: PokemonMove[];
}

const DAMAGE_CLASS: Record<string, [string, string]> = {
  physical: ["Físico", "Physical"],
  special: ["Especial", "Special"],
  status: ["Status", "Status"],
};

/** Uma linha da lista. Só busca o detalhe depois de aberta. */
const MoveRow = ({ move }: { move: LearnedMove }) => {
  const [open, setOpen] = useState(false);
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const detail = useMoveDetail(open ? move.name : undefined);
  const data = detail.data;

  const flavor = pickLocalized(data?.flavor_text_entries, (e) => e.flavor_text);
  const localizedName = pickLocalized(data?.names, (n) => n.name);

  return (
    <li className={"move-row" + (open ? " is-open" : "")}>
      <button
        type="button"
        className="move-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {move.level > 0 && <span className="move-level">{move.level}</span>}
        <span className="move-name">
          {localizedName || prettyMoveName(move.name)}
        </span>
        {data && (
          <span className="move-chip" data-type={data.type.name}>
            {tType(data.type.name)}
          </span>
        )}
        <span className="move-toggle" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="move-detail">
          {detail.isLoading ? (
            <p className="detail-muted">{t("Carregando…", "Loading…")}</p>
          ) : detail.isError ? (
            <p className="detail-muted">{t("Não deu para consultar este golpe.", "Couldn't load this move.")}</p>
          ) : data ? (
            <>
              <dl className="move-stats">
                <div>
                  <dt>{t("Poder", "Power")}</dt>
                  <dd>{data.power ?? "—"}</dd>
                </div>
                <div>
                  <dt>{t("Precisão", "Accuracy")}</dt>
                  <dd>{data.accuracy !== null ? `${data.accuracy}%` : "—"}</dd>
                </div>
                <div>
                  <dt>PP</dt>
                  <dd>{data.pp ?? "—"}</dd>
                </div>
                <div>
                  <dt>{t("Classe", "Category")}</dt>
                  <dd>
                    {DAMAGE_CLASS[data.damage_class.name]
                      ? t(...DAMAGE_CLASS[data.damage_class.name])
                      : data.damage_class.name}
                  </dd>
                </div>
              </dl>
              {flavor && <p className="move-flavor">{flavor}</p>}
            </>
          ) : (
            <p className="detail-muted">{t("Golpe não encontrado na API.", "Move not found in the API.")}</p>
          )}
        </div>
      )}
    </li>
  );
};

/**
 * Golpes do pokemon, por jogo e por metodo de aprendizado.
 *
 * A lista sai do objeto que a pagina ja tem — nenhum request. Poder, precisao e
 * descricao sao buscados por golpe, so quando a linha e aberta.
 */
const MoveList = ({ moves }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const versionGroups = useMemo(() => availableVersionGroups(moves), [moves]);
  const preferred = useMemo(() => preferredVersionGroup(moves), [moves]);
  const [chosen, setChosen] = useState<string | undefined>();
  // Ver `preferredVersionGroup`: o mais recente nem sempre e o util.
  const versionGroup = chosen ?? preferred;

  const groups = useMemo(
    () =>
      versionGroup
        ? groupByMethod(movesForVersionGroup(moves, versionGroup))
        : [],
    [moves, versionGroup]
  );

  if (versionGroups.length === 0) {
    return <p className="detail-muted">{t("Sem golpes registrados na API.", "No moves listed in the API.")}</p>;
  }

  return (
    <div className="move-block">
      <label className="move-version">
        <span>{t("Jogo", "Game")}</span>
        <select
          value={versionGroup}
          onChange={(e) => setChosen(e.target.value)}
        >
          {versionGroups.map((vg) => (
            <option key={vg} value={vg}>
              {versionGroupLabel(vg)}
            </option>
          ))}
        </select>
        {/* O seletor sempre nomeou Emerald, Crystal, FireRed — e a aba que roda
            exatamente esses ficava a um clique que nao existia. */}
        {isPlayable(versionGroup) && (
          <Link
            className="move-version-play"
            to={`/jogar?jogo=${versionGroup}`}
            title={t(`Abrir /jogar com ${versionGroupLabel(versionGroup)}`, `Open /jogar with ${versionGroupLabel(versionGroup)}`)}
          >
            {t("jogar", "play")}
          </Link>
        )}
      </label>

      {groups.map((group) => (
        <section key={group.method} className="move-group">
          <h4>
            {lang === "en" ? group.labelEn : group.label}
            <span className="move-count">{group.moves.length}</span>
          </h4>
          <ul className="move-list">
            {group.moves.map((m) => (
              <MoveRow key={`${m.name}-${m.method}`} move={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default MoveList;
