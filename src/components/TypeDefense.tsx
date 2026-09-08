import { defenseProfile, multiplierLabel } from "../lib/typeDefense";
import { tType } from "../data/i18n";

interface Props {
  types: string[];
}

/** Classe de cor por faixa de multiplicador. */
function toneOf(m: number): string {
  if (m === 0) return "is-immune";
  if (m > 1) return "is-weak";
  return "is-resist";
}

const TypeDefense = ({ types }: Props) => {
  const groups = defenseProfile(types);
  if (groups.length === 0) return null;

  return (
    <ul className="defense-list">
      {groups.map((g) => (
        <li key={g.multiplier} className={"defense-row " + toneOf(g.multiplier)}>
          <span className="defense-mult">{multiplierLabel(g.multiplier)}</span>
          <span className="defense-types">
            {g.types.map((t) => (
              <span key={t} className="card-type-dot-lg" data-type={t}>
                {tType(t)}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TypeDefense;
