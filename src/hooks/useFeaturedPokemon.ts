import { useState } from "react";
import { usePokemonDetail } from "./usePokemon";
import { LEGENDARY } from "../data/rarity";

function pickRandomLegendary(): string {
  return LEGENDARY[Math.floor(Math.random() * LEGENDARY.length)];
}

export function useFeaturedPokemon() {
  // Initializer só roda no mount — muda a cada F5 (novo mount), estável durante uso
  const [name] = useState<string>(pickRandomLegendary);
  return usePokemonDetail(name);
}
