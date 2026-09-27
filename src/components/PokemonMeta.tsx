import type { Pokemon, PokemonSpecies } from "../types/pokemon";
import { useLang, tr, type Lang } from "../i18n/lang";

interface Props {
  pokemon: Pokemon;
  species: PokemonSpecies | null | undefined;
}

const GROWTH: Record<string, [string, string]> = {
  slow: ["Lento", "Slow"],
  medium: ["Médio", "Medium"],
  fast: ["Rápido", "Fast"],
  "medium-slow": ["Médio-lento", "Medium slow"],
  "slow-then-very-fast": ["Lento, depois muito rápido", "Erratic"],
  "fast-then-very-slow": ["Rápido, depois muito lento", "Fluctuating"],
};

const EGG_GROUP: Record<string, [string, string]> = {
  monster: ["Monstro", "Monster"],
  water1: ["Água 1", "Water 1"],
  water2: ["Água 2", "Water 2"],
  water3: ["Água 3", "Water 3"],
  bug: ["Inseto", "Bug"],
  flying: ["Voador", "Flying"],
  ground: ["Campo", "Field"],
  fairy: ["Fada", "Fairy"],
  plant: ["Planta", "Grass"],
  humanshape: ["Humanoide", "Human-Like"],
  mineral: ["Mineral", "Mineral"],
  indeterminate: ["Amorfo", "Amorphous"],
  ditto: ["Ditto", "Ditto"],
  dragon: ["Dragão", "Dragon"],
  "no-eggs": ["Sem ovos", "Undiscovered"],
};

/** gender_rate vem em oitavos de chance de ser fêmea; -1 = sem gênero. */
function genderText(rate: number, lang: Lang): string {
  if (rate < 0) return tr(lang, "Sem gênero", "Genderless");
  const female = (rate / 8) * 100;
  return `${(100 - female).toFixed(1)}% ♂ · ${female.toFixed(1)}% ♀`;
}

/** A API dá decímetros e hectogramas. */
function heightText(dm: number): string {
  return `${(dm / 10).toFixed(1)} m`;
}
function weightText(hg: number): string {
  return `${(hg / 10).toFixed(1)} kg`;
}

const PokemonMeta = ({ pokemon, species }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const par = (m: Record<string, [string, string]>, k: string) => (m[k] ? t(...m[k]) : k);
  return (
  <dl className="detail-meta">
    <dt>{t("Altura", "Height")}</dt>
    <dd>{heightText(pokemon.height)}</dd>
    <dt>{t("Peso", "Weight")}</dt>
    <dd>{weightText(pokemon.weight)}</dd>
    {pokemon.base_experience !== null && pokemon.base_experience !== undefined && (
      <>
        <dt>{t("Exp. base", "Base exp.")}</dt>
        <dd>{pokemon.base_experience}</dd>
      </>
    )}
    {species && (
      <>
        <dt>{t("Captura", "Catch rate")}</dt>
        <dd>
          {species.capture_rate}/255{" "}
          <span className="detail-meta-hint">
            ({((species.capture_rate / 255) * 100).toFixed(0)}%)
          </span>
        </dd>
        <dt>{t("Gênero", "Gender")}</dt>
        <dd>{genderText(species.gender_rate, lang)}</dd>
        {species.growth_rate && (
          <>
            <dt>{t("Crescimento", "Growth rate")}</dt>
            <dd>{par(GROWTH, species.growth_rate.name)}</dd>
          </>
        )}
        {species.egg_groups.length > 0 && (
          <>
            <dt>{t("Grupos de ovo", "Egg groups")}</dt>
            <dd>
              {species.egg_groups
                .map((g) => par(EGG_GROUP, g.name))
                .join(" · ")}
            </dd>
          </>
        )}
        {species.hatch_counter !== null && (
          <>
            <dt>{t("Ciclos de choco", "Egg cycles")}</dt>
            <dd>{species.hatch_counter}</dd>
          </>
        )}
      </>
    )}
  </dl>
  );
};

export default PokemonMeta;
