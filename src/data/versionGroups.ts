/**
 * Os grupos de versao da PokeAPI, em ordem cronologica.
 *
 * A resposta de `/pokemon/` diz em quais jogos cada golpe e aprendido, mas nao
 * em que ordem esses jogos vieram — sem isso nao da para escolher "o mais
 * recente", que e o que quem consulta quase sempre quer.
 *
 * A ordem NAO e a que a API devolve. `/version-group` vem ordenado por id, que
 * e ordem de insercao e nao cronologia: `red-green-japan` e `blue-japan`, de
 * 1996, tem id 28 e 29 e aparecem depois de Scarlet/Violet. Confiar naquilo
 * fazia a tela do Pikachu abrir em "Blue (JP)". Aqui os dois voltam para o
 * comeco, que e o lugar deles.
 *
 * Os titulos ficam em ingles de proposito: sao nomes proprios, e e assim que os
 * jogos sao vendidos e citados no Brasil. Traduzi-los inventaria nomes que
 * ninguem usa.
 */
export const VERSION_GROUPS: { id: string; label: string }[] = [
  { id: "red-green-japan", label: "Red/Green (JP)" },
  { id: "blue-japan", label: "Blue (JP)" },
  { id: "red-blue", label: "Red/Blue" },
  { id: "yellow", label: "Yellow" },
  { id: "gold-silver", label: "Gold/Silver" },
  { id: "crystal", label: "Crystal" },
  { id: "ruby-sapphire", label: "Ruby/Sapphire" },
  { id: "emerald", label: "Emerald" },
  { id: "firered-leafgreen", label: "FireRed/LeafGreen" },
  { id: "diamond-pearl", label: "Diamond/Pearl" },
  { id: "platinum", label: "Platinum" },
  { id: "heartgold-soulsilver", label: "HeartGold/SoulSilver" },
  { id: "black-white", label: "Black/White" },
  { id: "colosseum", label: "Colosseum" },
  { id: "xd", label: "XD: Gale of Darkness" },
  { id: "black-2-white-2", label: "Black 2/White 2" },
  { id: "x-y", label: "X/Y" },
  { id: "omega-ruby-alpha-sapphire", label: "Omega Ruby/Alpha Sapphire" },
  { id: "sun-moon", label: "Sun/Moon" },
  { id: "ultra-sun-ultra-moon", label: "Ultra Sun/Ultra Moon" },
  { id: "lets-go-pikachu-lets-go-eevee", label: "Let's Go Pikachu/Eevee" },
  { id: "sword-shield", label: "Sword/Shield" },
  { id: "the-isle-of-armor", label: "The Isle of Armor" },
  { id: "the-crown-tundra", label: "The Crown Tundra" },
  { id: "brilliant-diamond-shining-pearl", label: "Brilliant Diamond/Shining Pearl" },
  { id: "legends-arceus", label: "Legends: Arceus" },
  { id: "scarlet-violet", label: "Scarlet/Violet" },
  { id: "the-teal-mask", label: "The Teal Mask" },
  { id: "the-indigo-disk", label: "The Indigo Disk" },
  { id: "legends-za", label: "Legends: Z-A" },
  { id: "mega-dimension", label: "Mega Dimension" },
  { id: "champions", label: "Champions" },
];

/** Posicao na ordem cronologica; -1 para um grupo que ainda nao conhecemos. */
const ORDER = new Map(VERSION_GROUPS.map((g, index) => [g.id, index]));

export function versionGroupOrder(id: string): number {
  return ORDER.get(id) ?? -1;
}

/**
 * Rotulo do jogo. Um grupo desconhecido — a PokeAPI ganha jogos novos — cai
 * para o proprio id em vez de sumir da lista.
 */
export function versionGroupLabel(id: string): string {
  return VERSION_GROUPS.find((g) => g.id === id)?.label ?? id;
}
