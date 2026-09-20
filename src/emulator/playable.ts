/**
 * Quais jogos o core desta aba consegue rodar.
 *
 * O core é mGBA compilado para WebAssembly, então ele roda cartucho de Game
 * Boy, Game Boy Color e Game Boy Advance — nada além disso. As gerações I, II e
 * III nasceram nesses três aparelhos; da IV em diante são DS, 3DS, Switch, e
 * ficam de fora por hardware, não por escolha.
 *
 * A exceção que o número da geração sozinho erraria: **Colosseum e XD são de
 * Gen III e não são jogáveis aqui** — saíram no GameCube. Por isso a lista é
 * de ids de grupo de versão, e não `geracao <= 3`.
 *
 * Os ids são os de `src/data/versionGroups.ts`, para que o resto do site possa
 * cruzar sem tradução no meio.
 */
import { VERSION_GROUPS } from "../data/versionGroups";

/** Grupos de versão que rodam num cartucho de GB, GBC ou GBA. */
export const PLAYABLE_VERSION_GROUPS = [
  // Game Boy
  "red-green-japan",
  "blue-japan",
  "red-blue",
  "yellow",
  // Game Boy Color
  "gold-silver",
  "crystal",
  // Game Boy Advance
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
] as const;

export type PlayableVersionGroup = (typeof PLAYABLE_VERSION_GROUPS)[number];

const JOGAVEIS = new Set<string>(PLAYABLE_VERSION_GROUPS);

/**
 * O emulador da aba /jogar consegue rodar este grupo de versão?
 *
 * Type guard e não `boolean`: quem chama costuma ter um `string | undefined` em
 * mãos e usa isto como condição para montar o link — sem o guard, o TypeScript
 * não estreita e o id chegaria possivelmente indefinido na URL.
 */
export function isPlayable(
  versionGroupId: string | undefined
): versionGroupId is string {
  return versionGroupId !== undefined && JOGAVEIS.has(versionGroupId);
}

/**
 * Gerações inteiramente jogáveis aqui — usado por telas que só têm o número da
 * geração à mão, como os cards da aba de Gerações.
 */
export function isPlayableGeneration(geracao: number): boolean {
  return geracao >= 1 && geracao <= 3;
}

/**
 * Todo id desta lista existe em `VERSION_GROUPS`.
 *
 * Exportado para o teste conseguir cobrar isso: um id escrito errado aqui
 * simplesmente nunca casaria, e o link nunca apareceria — falha silenciosa.
 */
export const KNOWN_VERSION_GROUP_IDS = new Set(VERSION_GROUPS.map((g) => g.id));
