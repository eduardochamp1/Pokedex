/**
 * Natureza e fórmula de status de Gen 3.
 *
 * Existe para a ficha de cada pokémon do time lido do save: o save guarda IVs,
 * EVs e a natureza, e a tela precisa dizer o que eles significam. A fórmula foi
 * conferida contra o próprio save — os seis status que o jogo gravou num
 * Mudkip nv 8 bateram com a conta feita aqui.
 */

export type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
export type StatSpread = Record<StatKey, number>;

export interface Nature {
  name: string;
  /** Sobe 10%. `undefined` nas cinco neutras. */
  up?: Exclude<StatKey, "hp">;
  /** Desce 10%. */
  down?: Exclude<StatKey, "hp">;
}

/**
 * A ordem das naturezas é uma grade 5×5: `PV % 25` dá a posição, a linha diz
 * o que sobe e a coluna o que desce, nesta ordem de status.
 */
const GRADE: Exclude<StatKey, "hp">[] = ["atk", "def", "spe", "spa", "spd"];
const NOMES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

export const NATURES: Nature[] = NOMES.map((name, i) => {
  const linha = Math.floor(i / 5);
  const coluna = i % 5;
  return linha === coluna ? { name } : { name, up: GRADE[linha], down: GRADE[coluna] };
});

export function natureOf(index: number): Nature | undefined {
  return Number.isInteger(index) && index >= 0 && index < 25 ? NATURES[index] : undefined;
}

/** Shedinja: a fórmula não vale, o HP é 1 em qualquer nível. */
const SHEDINJA = 292;

export function calcGen3Stat(
  stat: StatKey,
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: number,
  national?: number
): number {
  const miolo = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  if (stat === "hp") return national === SHEDINJA ? 1 : miolo + level + 10;
  const n = natureOf(nature);
  // Em inteiros, como o jogo. Com 1.1 e 0.9 em ponto flutuante dá o mesmo em
  // toda a faixa de 1 a 999 (conferido), mas assim não depende disso.
  const porCento = n?.up === stat ? 110 : n?.down === stat ? 90 : 100;
  return Math.floor(((miolo + 5) * porCento) / 100);
}

export function expectedGen3Stats(
  base: StatSpread,
  ivs: StatSpread,
  evs: StatSpread,
  level: number,
  nature: number,
  national?: number
): StatSpread {
  const k = (s: StatKey) => calcGen3Stat(s, base[s], ivs[s], evs[s], level, nature, national);
  return { hp: k("hp"), atk: k("atk"), def: k("def"), spa: k("spa"), spd: k("spd"), spe: k("spe") };
}
