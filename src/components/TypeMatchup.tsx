import { attackMultiplier, type TypeName } from "../data/typeMatchups";

interface Props {
  attacker: string[];
  defender: string[];
  side: "left" | "right";
}

function label(m: number): string {
  if (m === 0) return "sem efeito";
  return `${m}×`;
}

function color(m: number): string {
  if (m === 0) return "var(--text-dim)";
  if (m >= 2) return "var(--t-grass)";
  if (m <= 0.5) return "var(--t-fire)";
  return "var(--text-muted)";
}

const TypeMatchup = ({ attacker, defender, side }: Props) => {
  return (
    <ul className={"matchup-list matchup-" + side}>
      {attacker.map((a) => {
        const m = attackMultiplier(a as TypeName, defender as TypeName[]);
        return (
          <li key={a} className="matchup-row">
            <span className="card-type-dot-lg" data-type={a}>{a}</span>
            <span className="matchup-value" style={{ color: color(m) }}>
              {label(m)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default TypeMatchup;
