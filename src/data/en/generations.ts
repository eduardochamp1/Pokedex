import type { GameGeneration } from "../generations";

/** Texto em inglês de `GAME_GENERATIONS`, por id. */
export const GAME_GENERATIONS_EN: Record<string, Pick<GameGeneration, "gimmick">> = {
  1: { gimmick: "The beginning — 15 types, no abilities, no held items." },
  2: { gimmick: "Day/night cycle, the Dark and Steel types, Eggs and breeding." },
  3: { gimmick: "Abilities, natures, contests, double battles." },
  4: { gimmick: "Physical/special split per move (no longer per type), Wi-Fi on the DS." },
  5: {
    gimmick:
      "In Black and White, no older Pokémon appears before the postgame — a complete reset. The sequels walk that back.",
  },
  6: { gimmick: "3D models, Mega Evolution, the Fairy type." },
  7: { gimmick: "Z-Moves, Alolan regional forms, islands with Kahunas." },
  8: { gimmick: "Dynamax/Gigantamax, the Wild Area, Hisuian forms in Legends: Arceus." },
  9: { gimmick: "Open world, Terastallization, three parallel stories." },
};
