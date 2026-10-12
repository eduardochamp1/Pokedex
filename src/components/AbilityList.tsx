import { Link } from "react-router-dom";
import { useAbilities } from "../hooks/useAbilities";
import { pickLocalized } from "../lib/localize";
import type { PokemonAbility } from "../types/pokemon";
import { useT } from "../i18n/lang";
import { usePtAbilities } from "../i18n/ptData";

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
  const t = useT();
  const pt = usePtAbilities();

  if (abilities.length === 0) {
    return <p className="detail-muted">{t("Sem habilidades registradas.", "No abilities listed.")}</p>;
  }

  return (
    <ul className="ability-list">
      {resolved.map((a) => {
        // O nome da PokéAPI (inglês) fica ao lado do traduzido: é por ele que
        // quem joga conhece a habilidade.
        const original =
          pickLocalized(a.detail?.names, (n) => n.name) || humanize(a.slug);
        const nome = pt?.[a.slug]?.name ?? original;
        const efeito =
          pt?.[a.slug]?.short ??
          pickLocalized(a.detail?.effect_entries, (e) => e.short_effect);
        return (
          <li key={a.slug} className="ability-item">
            <div className="ability-head">
              <strong>
                <Link to={`/habilidade/${a.slug}`} title={t("Todos os pokémon com esta habilidade", "Every Pokémon with this ability")}>
                  {nome}
                </Link>
              </strong>
              {nome !== original && (
                <span className="nome-original" lang="en">
                  {original}
                </span>
              )}
              {a.isHidden && <span className="ability-hidden">{t("oculta", "hidden")}</span>}
            </div>
            {efeito ? (
              <p className="ability-effect">{efeito}</p>
            ) : isLoading ? (
              <p className="ability-effect detail-muted">{t("Carregando…", "Loading…")}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default AbilityList;
