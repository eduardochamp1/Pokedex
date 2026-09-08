import { REGIONS } from "../data/regions";

/**
 * Resolve a regiao de origem de um pokemon para linkar no mapa.
 *
 * Duas fontes, em ordem de precisao:
 *  1. o pokemon esta listado como emblematico de alguma regiao (REGIONS.signature)
 *  2. a geracao da especie ("generation-iv" -> Sinnoh)
 */

const GENERATION_ORDINALS = [
  "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix",
] as const;

/** "generation-iv" -> 4; retorna undefined para entradas desconhecidas. */
export function generationNumberFromName(
  generationName: string | undefined | null
): number | undefined {
  if (!generationName) return undefined;
  const ordinal = generationName.toLowerCase().replace(/^generation-/, "");
  const idx = GENERATION_ORDINALS.indexOf(
    ordinal as (typeof GENERATION_ORDINALS)[number]
  );
  return idx >= 0 ? idx + 1 : undefined;
}

export function regionIdForGeneration(
  generationName: string | undefined | null
): string | undefined {
  const gen = generationNumberFromName(generationName);
  if (gen === undefined) return undefined;
  return REGIONS.find((r) => r.generation === gen)?.id;
}

export function regionIdForSignaturePokemon(
  pokemonName: string | undefined | null
): string | undefined {
  if (!pokemonName) return undefined;
  const name = pokemonName.toLowerCase();
  return REGIONS.find((r) =>
    r.signature.some((s) => s.toLowerCase() === name)
  )?.id;
}

export function regionIdForPokemon(
  pokemonName: string | undefined | null,
  generationName: string | undefined | null
): string | undefined {
  return (
    regionIdForSignaturePokemon(pokemonName) ??
    regionIdForGeneration(generationName)
  );
}
