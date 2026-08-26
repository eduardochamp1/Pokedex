import { usePokemonDetail } from "./usePokemon";

const TOTAL_SPECIES = 1025;

function pickIdFromDate(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const seed = y * 10000 + m * 100 + d;
  return (seed % TOTAL_SPECIES) + 1;
}

export function useFeaturedPokemon() {
  const id = pickIdFromDate(new Date());
  return usePokemonDetail(String(id));
}
