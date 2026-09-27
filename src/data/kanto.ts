import type { Badge } from "./hoenn";

/**
 * As insígnias de Kanto na ordem das flags de FireRed/LeafGreen
 * (FLAG_BADGE01_GET…08, da decompilação pokefirered) — a ordem dos ginásios.
 * O save medido tem as oito desligadas, então a ordem não foi conferida nele.
 */
export const KANTO_BADGES: Badge[] = [
  { name: "Boulder Badge", leader: "Brock", city: "Pewter City" },
  { name: "Cascade Badge", leader: "Misty", city: "Cerulean City" },
  { name: "Thunder Badge", leader: "Lt. Surge", city: "Vermilion City" },
  { name: "Rainbow Badge", leader: "Erika", city: "Celadon City" },
  { name: "Soul Badge", leader: "Koga", city: "Fuchsia City" },
  { name: "Marsh Badge", leader: "Sabrina", city: "Saffron City" },
  { name: "Volcano Badge", leader: "Blaine", city: "Cinnabar Island" },
  { name: "Earth Badge", leader: "Giovanni", city: "Viridian City" },
];
