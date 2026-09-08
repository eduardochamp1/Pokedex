import type { Pokemon, PokemonSpecies } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
  species: PokemonSpecies | null | undefined;
}

const GROWTH_PT: Record<string, string> = {
  slow: "Lento",
  medium: "Médio",
  fast: "Rápido",
  "medium-slow": "Médio-lento",
  "slow-then-very-fast": "Lento, depois muito rápido",
  "fast-then-very-slow": "Rápido, depois muito lento",
};

const EGG_GROUP_PT: Record<string, string> = {
  monster: "Monstro",
  water1: "Água 1",
  water2: "Água 2",
  water3: "Água 3",
  bug: "Inseto",
  flying: "Voador",
  ground: "Campo",
  fairy: "Fada",
  plant: "Planta",
  humanshape: "Humanoide",
  mineral: "Mineral",
  indeterminate: "Amorfo",
  ditto: "Ditto",
  dragon: "Dragão",
  "no-eggs": "Sem ovos",
};

/** gender_rate vem em oitavos de chance de ser fêmea; -1 = sem gênero. */
function genderText(rate: number): string {
  if (rate < 0) return "Sem gênero";
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

const PokemonMeta = ({ pokemon, species }: Props) => (
  <dl className="detail-meta">
    <dt>Altura</dt>
    <dd>{heightText(pokemon.height)}</dd>
    <dt>Peso</dt>
    <dd>{weightText(pokemon.weight)}</dd>
    {pokemon.base_experience !== null && pokemon.base_experience !== undefined && (
      <>
        <dt>Exp. base</dt>
        <dd>{pokemon.base_experience}</dd>
      </>
    )}
    {species && (
      <>
        <dt>Captura</dt>
        <dd>
          {species.capture_rate}/255{" "}
          <span className="detail-meta-hint">
            ({((species.capture_rate / 255) * 100).toFixed(0)}%)
          </span>
        </dd>
        <dt>Gênero</dt>
        <dd>{genderText(species.gender_rate)}</dd>
        {species.growth_rate && (
          <>
            <dt>Crescimento</dt>
            <dd>{GROWTH_PT[species.growth_rate.name] ?? species.growth_rate.name}</dd>
          </>
        )}
        {species.egg_groups.length > 0 && (
          <>
            <dt>Grupos de ovo</dt>
            <dd>
              {species.egg_groups
                .map((g) => EGG_GROUP_PT[g.name] ?? g.name)
                .join(" · ")}
            </dd>
          </>
        )}
        {species.hatch_counter !== null && (
          <>
            <dt>Ciclos de choco</dt>
            <dd>{species.hatch_counter}</dd>
          </>
        )}
      </>
    )}
  </dl>
);

export default PokemonMeta;
