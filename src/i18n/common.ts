/**
 * Rótulos que várias telas repetem. Um lugar só para a tradução não divergir
 * entre a ficha, o Comparar e o montador de time.
 */
import type { Lang } from "./lang";

const STATS: Record<string, [string, string]> = {
  hp: ["PS", "HP"],
  attack: ["Atq", "Atk"],
  defense: ["Def", "Def"],
  "special-attack": ["Atq Esp", "Sp. Atk"],
  "special-defense": ["Def Esp", "Sp. Def"],
  speed: ["Vel", "Spe"],
};

/** Nome curto do status pelo slug da PokéAPI; desconhecido volta como veio. */
export function statLabel(slug: string, lang: Lang): string {
  const par = STATS[slug];
  if (!par) return slug;
  return lang === "en" ? par[1] : par[0];
}

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/** "Geração III" / "Generation III". */
export function generationLabel(n: number, lang: Lang): string {
  return `${lang === "en" ? "Generation" : "Geração"} ${ROMANOS[n] ?? n}`;
}
