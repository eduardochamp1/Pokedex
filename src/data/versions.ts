/**
 * Versões de jogo como a PokéAPI as chama em `/pokemon/{id}/encounters`.
 *
 * Os encontros vêm por **versão** ("ruby", "emerald"), não por grupo de versão
 * como os golpes — então a ordem cronológica e a região saem daqui, apontando
 * para o grupo de `versionGroups.ts` e para o id de região do mapa.
 */
import { versionGroupOrder } from "./versionGroups";

interface Version {
  label: string;
  group: string;
  /** Id em `data/regions.ts`, para o link "ver no mapa". */
  region?: string;
}

const V: Record<string, Version> = {
  red: { label: "Red", group: "red-blue", region: "kanto" },
  blue: { label: "Blue", group: "red-blue", region: "kanto" },
  yellow: { label: "Yellow", group: "yellow", region: "kanto" },
  gold: { label: "Gold", group: "gold-silver", region: "johto" },
  silver: { label: "Silver", group: "gold-silver", region: "johto" },
  crystal: { label: "Crystal", group: "crystal", region: "johto" },
  ruby: { label: "Ruby", group: "ruby-sapphire", region: "hoenn" },
  sapphire: { label: "Sapphire", group: "ruby-sapphire", region: "hoenn" },
  emerald: { label: "Emerald", group: "emerald", region: "hoenn" },
  firered: { label: "FireRed", group: "firered-leafgreen", region: "kanto" },
  leafgreen: { label: "LeafGreen", group: "firered-leafgreen", region: "kanto" },
  diamond: { label: "Diamond", group: "diamond-pearl", region: "sinnoh" },
  pearl: { label: "Pearl", group: "diamond-pearl", region: "sinnoh" },
  platinum: { label: "Platinum", group: "platinum", region: "sinnoh" },
  heartgold: { label: "HeartGold", group: "heartgold-soulsilver", region: "johto" },
  soulsilver: { label: "SoulSilver", group: "heartgold-soulsilver", region: "johto" },
  black: { label: "Black", group: "black-white", region: "unova" },
  white: { label: "White", group: "black-white", region: "unova" },
  "black-2": { label: "Black 2", group: "black-2-white-2", region: "unova" },
  "white-2": { label: "White 2", group: "black-2-white-2", region: "unova" },
  x: { label: "X", group: "x-y", region: "kalos" },
  y: { label: "Y", group: "x-y", region: "kalos" },
  "omega-ruby": { label: "Omega Ruby", group: "omega-ruby-alpha-sapphire", region: "hoenn" },
  "alpha-sapphire": { label: "Alpha Sapphire", group: "omega-ruby-alpha-sapphire", region: "hoenn" },
  sun: { label: "Sun", group: "sun-moon", region: "alola" },
  moon: { label: "Moon", group: "sun-moon", region: "alola" },
  "ultra-sun": { label: "Ultra Sun", group: "ultra-sun-ultra-moon", region: "alola" },
  "ultra-moon": { label: "Ultra Moon", group: "ultra-sun-ultra-moon", region: "alola" },
  "lets-go-pikachu": { label: "Let's Go Pikachu", group: "lets-go-pikachu-lets-go-eevee", region: "kanto" },
  "lets-go-eevee": { label: "Let's Go Eevee", group: "lets-go-pikachu-lets-go-eevee", region: "kanto" },
  sword: { label: "Sword", group: "sword-shield", region: "galar" },
  shield: { label: "Shield", group: "sword-shield", region: "galar" },
  "the-isle-of-armor-sword": { label: "Isle of Armor (Sword)", group: "the-isle-of-armor", region: "galar" },
  "the-isle-of-armor-shield": { label: "Isle of Armor (Shield)", group: "the-isle-of-armor", region: "galar" },
  "the-crown-tundra-sword": { label: "Crown Tundra (Sword)", group: "the-crown-tundra", region: "galar" },
  "the-crown-tundra-shield": { label: "Crown Tundra (Shield)", group: "the-crown-tundra", region: "galar" },
  "brilliant-diamond": { label: "Brilliant Diamond", group: "brilliant-diamond-shining-pearl", region: "sinnoh" },
  "shining-pearl": { label: "Shining Pearl", group: "brilliant-diamond-shining-pearl", region: "sinnoh" },
  "legends-arceus": { label: "Legends: Arceus", group: "legends-arceus", region: "sinnoh" },
  scarlet: { label: "Scarlet", group: "scarlet-violet", region: "paldea" },
  violet: { label: "Violet", group: "scarlet-violet", region: "paldea" },
};

const tituloDe = (slug: string) =>
  slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

/** Versão desconhecida (a PokéAPI ganha jogos novos) não some: vira título. */
export function versionLabel(name: string): string {
  return V[name]?.label ?? tituloDe(name);
}

export function versionRegion(name: string): string | undefined {
  return V[name]?.region;
}

/** O grupo de versão ("emerald" -> "emerald", "leafgreen" -> "firered-leafgreen"). */
export function versionGroupOf(name: string): string | undefined {
  return V[name]?.group;
}

/**
 * Posição cronológica. Dentro do mesmo grupo vale a ordem da tabela acima
 * (Ruby antes de Sapphire); desconhecida vai para o fim.
 */
export function versionOrder(name: string): number {
  const v = V[name];
  if (!v) return Number.MAX_SAFE_INTEGER;
  const grupo = versionGroupOrder(v.group);
  return (grupo < 0 ? 999 : grupo) * 100 + Object.keys(V).indexOf(name);
}
