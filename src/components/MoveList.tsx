import { useMemo, useState } from "react";
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
import { tType } from "../data/i18n";
import type { PokemonMove } from "../types/pokemon";

interface Props {
  moves: PokemonMove[];
}

const DAMAGE_CLASS: Record<string, string> = {
  physical: "Físico",
  special: "Especial",
  status: "Status",
};

/** Uma linha da lista. Só busca o detalhe depois de aberta. */
const MoveRow = ({ move }: { move: LearnedMove }) => {
  const [open, setOpen] = useState(false);
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
            <p className="detail-muted">Carregando…</p>
          ) : detail.isError ? (
            <p className="detail-muted">Não deu para consultar este golpe.</p>
          ) : data ? (
            <>
              <dl className="move-stats">
                <div>
                  <dt>Poder</dt>
                  <dd>{data.power ?? "—"}</dd>
                </div>
                <div>
                  <dt>Precisão</dt>
                  <dd>{data.accuracy !== null ? `${data.accuracy}%` : "—"}</dd>
                </div>
                <div>
                  <dt>PP</dt>
                  <dd>{data.pp ?? "—"}</dd>
                </div>
                <div>
                  <dt>Classe</dt>
                  <dd>
                    {DAMAGE_CLASS[data.damage_class.name] ??
                      data.damage_class.name}
                  </dd>
                </div>
              </dl>
              {flavor && <p className="move-flavor">{flavor}</p>}
            </>
          ) : (
            <p className="detail-muted">Golpe não encontrado na API.</p>
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
    return <p className="detail-muted">Sem golpes registrados na API.</p>;
  }

  return (
    <div className="move-block">
      <label className="move-version">
        <span>Jogo</span>
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
      </label>

      {groups.map((group) => (
        <section key={group.method} className="move-group">
          <h4>
            {group.label}
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
