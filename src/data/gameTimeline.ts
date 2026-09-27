/**
 * Os jogos principais, de Red & Green (1996) em diante, para a linha do tempo
 * de `/jogos`.
 *
 * O ano é o do lançamento no Japão, o primeiro de cada um — exceto Red & Blue
 * internacional, que é o lançamento fora do Japão (1998) e tem grupo de versão
 * próprio na PokéAPI. `versionGroup` usa os ids de `versionGroups.ts`, que é o
 * que liga o jogo ao emulador (`/jogar?jogo=`) e ao resto do site.
 */
export type Platform = "Game Boy" | "Game Boy Color" | "Game Boy Advance" | "Nintendo DS" | "Nintendo 3DS" | "Nintendo Switch";

export interface TimelineGame {
  title: string;
  year: number;
  platform: Platform;
  generation: number;
  /** Id de `regions.ts`; Hisui não tem mapa próprio no site. */
  region: string;
  versionGroup: string;
  remake?: boolean;
  /** Uma linha sobre o jogo, em PT e EN. */
  note?: [string, string];
}

export const TIMELINE_GAMES: TimelineGame[] = [
  { title: "Red & Green", year: 1996, platform: "Game Boy", generation: 1, region: "kanto", versionGroup: "red-green-japan", note: ["Só no Japão; o começo de tudo.", "Japan only; where it all began."] },
  { title: "Blue", year: 1996, platform: "Game Boy", generation: 1, region: "kanto", versionGroup: "blue-japan", note: ["Versão revisada, vendida por correio no Japão.", "A revised version, first sold by mail order in Japan."] },
  { title: "Red & Blue", year: 1998, platform: "Game Boy", generation: 1, region: "kanto", versionGroup: "red-blue", note: ["O lançamento fora do Japão.", "The release outside Japan."] },
  { title: "Yellow", year: 1998, platform: "Game Boy", generation: 1, region: "kanto", versionGroup: "yellow", note: ["O Pikachu do anime segue o jogador.", "The anime's Pikachu follows the player."] },
  { title: "Gold & Silver", year: 1999, platform: "Game Boy Color", generation: 2, region: "johto", versionGroup: "gold-silver", note: ["Johto e, depois dela, Kanto inteira de novo.", "Johto, and then all of Kanto again."] },
  { title: "Crystal", year: 2000, platform: "Game Boy Color", generation: 2, region: "johto", versionGroup: "crystal", note: ["Primeira vez que dá para jogar como menina.", "The first time you can play as a girl."] },
  { title: "Ruby & Sapphire", year: 2002, platform: "Game Boy Advance", generation: 3, region: "hoenn", versionGroup: "ruby-sapphire" },
  { title: "FireRed & LeafGreen", year: 2004, platform: "Game Boy Advance", generation: 3, region: "kanto", versionGroup: "firered-leafgreen", remake: true },
  { title: "Emerald", year: 2004, platform: "Game Boy Advance", generation: 3, region: "hoenn", versionGroup: "emerald", note: ["Rayquaza no centro da história; a Battle Frontier.", "Rayquaza at the center of the story; the Battle Frontier."] },
  { title: "Diamond & Pearl", year: 2006, platform: "Nintendo DS", generation: 4, region: "sinnoh", versionGroup: "diamond-pearl" },
  { title: "Platinum", year: 2008, platform: "Nintendo DS", generation: 4, region: "sinnoh", versionGroup: "platinum" },
  { title: "HeartGold & SoulSilver", year: 2009, platform: "Nintendo DS", generation: 4, region: "johto", versionGroup: "heartgold-soulsilver", remake: true },
  { title: "Black & White", year: 2010, platform: "Nintendo DS", generation: 5, region: "unova", versionGroup: "black-white" },
  { title: "Black 2 & White 2", year: 2012, platform: "Nintendo DS", generation: 5, region: "unova", versionGroup: "black-2-white-2", note: ["As primeiras sequências diretas da série.", "The series' first direct sequels."] },
  { title: "X & Y", year: 2013, platform: "Nintendo 3DS", generation: 6, region: "kalos", versionGroup: "x-y" },
  { title: "Omega Ruby & Alpha Sapphire", year: 2014, platform: "Nintendo 3DS", generation: 6, region: "hoenn", versionGroup: "omega-ruby-alpha-sapphire", remake: true },
  { title: "Sun & Moon", year: 2016, platform: "Nintendo 3DS", generation: 7, region: "alola", versionGroup: "sun-moon" },
  { title: "Ultra Sun & Ultra Moon", year: 2017, platform: "Nintendo 3DS", generation: 7, region: "alola", versionGroup: "ultra-sun-ultra-moon" },
  { title: "Let's Go, Pikachu! & Let's Go, Eevee!", year: 2018, platform: "Nintendo Switch", generation: 7, region: "kanto", versionGroup: "lets-go-pikachu-lets-go-eevee", remake: true },
  { title: "Sword & Shield", year: 2019, platform: "Nintendo Switch", generation: 8, region: "galar", versionGroup: "sword-shield" },
  { title: "Brilliant Diamond & Shining Pearl", year: 2021, platform: "Nintendo Switch", generation: 8, region: "sinnoh", versionGroup: "brilliant-diamond-shining-pearl", remake: true },
  { title: "Legends: Arceus", year: 2022, platform: "Nintendo Switch", generation: 8, region: "hisui", versionGroup: "legends-arceus", note: ["Sinnoh no passado, quando se chamava Hisui.", "Sinnoh in the past, back when it was called Hisui."] },
  { title: "Scarlet & Violet", year: 2022, platform: "Nintendo Switch", generation: 9, region: "paldea", versionGroup: "scarlet-violet" },
  { title: "Legends: Z-A", year: 2025, platform: "Nintendo Switch", generation: 9, region: "kalos", versionGroup: "legends-za", note: ["Lumiose City, em Kalos.", "Lumiose City, in Kalos."] },
];
