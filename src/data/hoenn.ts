/**
 * Hoenn como o save de Emerald o numera.
 *
 * As ordens vêm da decompilação (pokeemerald) e foram conferidas até onde o
 * save real permitiu: as flags de cidade 0 e 1 (Littleroot, Oldale) ligadas e
 * a 7 (Petalburg) desligada, coerente com um jogo salvo em Oldale; e o mapa
 * 0.10 é Oldale Town. As insígnias estão todas desligadas nesse save, então a
 * ordem delas é a da decompilação, sem conferência — é a ordem dos ginásios.
 */

export interface Badge {
  name: string;
  leader: string;
  city: string;
}

export const HOENN_BADGES: Badge[] = [
  { name: "Stone Badge", leader: "Roxanne", city: "Rustboro City" },
  { name: "Knuckle Badge", leader: "Brawly", city: "Dewford Town" },
  { name: "Dynamo Badge", leader: "Wattson", city: "Mauville City" },
  { name: "Heat Badge", leader: "Flannery", city: "Lavaridge Town" },
  { name: "Balance Badge", leader: "Norman", city: "Petalburg City" },
  { name: "Feather Badge", leader: "Winona", city: "Fortree City" },
  { name: "Mind Badge", leader: "Tate & Liza", city: "Mossdeep City" },
  { name: "Rain Badge", leader: "Juan", city: "Sootopolis City" },
];

/** Na ordem das flags de "visitou" (FLAG_VISITED_*): cidades pequenas, depois as grandes. */
export const HOENN_TOWNS = [
  "Littleroot Town",
  "Oldale Town",
  "Dewford Town",
  "Lavaridge Town",
  "Fallarbor Town",
  "Verdanturf Town",
  "Pacifidlog Town",
  "Petalburg City",
  "Slateport City",
  "Mauville City",
  "Rustboro City",
  "Fortree City",
  "Lilycove City",
  "Mossdeep City",
  "Sootopolis City",
  "Ever Grande City",
];

/** Grupo 0 de mapas: as 16 cidades nesta ordem, e as rotas 101–134 depois. */
const GRUPO_0_CIDADES = [
  "Petalburg City",
  "Slateport City",
  "Mauville City",
  "Rustboro City",
  "Fortree City",
  "Lilycove City",
  "Mossdeep City",
  "Sootopolis City",
  "Ever Grande City",
  "Littleroot Town",
  "Oldale Town",
  "Dewford Town",
  "Lavaridge Town",
  "Fallarbor Town",
  "Verdanturf Town",
  "Pacifidlog Town",
];
const PRIMEIRA_ROTA = GRUPO_0_CIDADES.length;
const ROTAS = 34;

/**
 * Nome do lugar onde o save foi feito. Só o grupo 0 (cidades e rotas ao ar
 * livre) é conhecido; dentro de prédios e cavernas devolve `undefined`.
 */
export function hoennLocationName(group: number, num: number): string | undefined {
  if (group !== 0) return undefined;
  if (num < PRIMEIRA_ROTA) return GRUPO_0_CIDADES[num];
  if (num < PRIMEIRA_ROTA + ROTAS) return `Route ${101 + num - PRIMEIRA_ROTA}`;
  return undefined;
}
