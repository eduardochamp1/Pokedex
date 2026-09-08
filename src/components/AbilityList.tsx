import { useAbilities } from "../hooks/useAbilities";
import { pickLocalized } from "../lib/localize";
import type { PokemonAbility } from "../types/pokemon";

interface Props {
  abilities: PokemonAbility[];
}

/** "solar-power" -> "Solar Power" (fallback quando nao ha nome localizado). */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const AbilityList = ({ abilities }: Props) => {
  const { resolved, isLoading } = useAbilities(abilities);

  if (abilities.length === 0) {
    return <p className="detail-muted">Sem habilidades registradas.</p>;
  }

  return (
    <ul className="ability-list">
      {resolved.map((a) => {
        const nome =
          pickLocalized(a.detail?.names, (n) => n.name) || humanize(a.slug);
        const efeito = pickLocalized(
          a.detail?.effect_entries,
          (e) => e.short_effect
        );
        return (
          <li key={a.slug} className="ability-item">
            <div className="ability-head">
              <strong>{nome}</strong>
              {a.isHidden && <span className="ability-hidden">oculta</span>}
            </div>
            {efeito ? (
              <p className="ability-effect">{efeito}</p>
            ) : isLoading ? (
              <p className="ability-effect detail-muted">Carregando…</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default AbilityList;
