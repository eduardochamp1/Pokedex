/**
 * Chance de captura com as regras de Gen 3 — as de Emerald, o jogo que o
 * emulador lê.
 *
 * Segue a decompilação (pokeemerald, `Cmd_handleballthrow`) passo a passo, em
 * aritmética inteira como o jogo: a divisão trunca a cada operação, e as
 * raízes são inteiras. Isso muda o resultado: um Rayquaza dormindo a 1 PS com
 * Ultra Ball dá 4,4% assim, e 4,7% com a conta em ponto flutuante.
 *
 *   a = (taxa × bola / 10) × (3·HPmáx − 2·HP) / (3·HPmáx)
 *   sono/congelado: a × 2;  veneno/queimadura/paralisia: a × 15 / 10
 *   a > 254 → captura
 *   senão b = 1048560 / √(√(16711680 / a)), e cada uma das quatro sacudidas
 *   passa se um aleatório de 16 bits for menor que b: chance = (b / 65536)^4
 */

export type Status = "none" | "sleep" | "freeze" | "paralysis" | "poison" | "burn";

export const STATUSES: { id: Status; label: string; labelEn: string }[] = [
  { id: "none", label: "Nenhum", labelEn: "None" },
  { id: "sleep", label: "Dormindo", labelEn: "Asleep" },
  { id: "freeze", label: "Congelado", labelEn: "Frozen" },
  { id: "paralysis", label: "Paralisado", labelEn: "Paralyzed" },
  { id: "poison", label: "Envenenado", labelEn: "Poisoned" },
  { id: "burn", label: "Queimado", labelEn: "Burned" },
];

export type BallId = "poke" | "great" | "ultra" | "master" | "net" | "nest" | "repeat" | "timer";

export const BALLS: { id: BallId; label: string; note?: [string, string] }[] = [
  { id: "poke", label: "Poké Ball" },
  { id: "great", label: "Great Ball" },
  { id: "ultra", label: "Ultra Ball" },
  { id: "net", label: "Net Ball", note: ["×3 em água e inseto", "×3 on Water and Bug types"] },
  { id: "nest", label: "Nest Ball", note: ["melhor quanto menor o nível", "better the lower the level"] },
  { id: "repeat", label: "Repeat Ball", note: ["×3 se você já tem a espécie", "×3 if you already caught the species"] },
  { id: "timer", label: "Timer Ball", note: ["melhora a cada turno", "improves every turn"] },
  { id: "master", label: "Master Ball" },
];

export interface BallContext {
  types: string[];
  level: number;
  owned: boolean;
  turn: number;
}

/** Multiplicador da bola ×10, como o jogo guarda; a Master é à parte. */
export function ballMultiplier(ball: BallId, ctx: BallContext): number | "master" {
  switch (ball) {
    case "poke":
      return 10;
    case "great":
      return 15;
    case "ultra":
      return 20;
    case "master":
      return "master";
    case "net":
      return ctx.types.includes("water") || ctx.types.includes("bug") ? 30 : 10;
    case "nest": {
      if (ctx.level >= 40) return 10;
      const m = 40 - ctx.level;
      return m <= 9 ? 10 : m;
    }
    case "repeat":
      return ctx.owned ? 30 : 10;
    case "timer":
      return Math.min(40, ctx.turn + 10);
  }
}

export interface CaptureInput {
  catchRate: number;
  ball: number | "master";
  maxHp: number;
  hp: number;
  status: Status;
}

export function captureOdds({ catchRate, ball, maxHp, hp, status }: CaptureInput): number {
  const bola = ball === "master" ? 10 : ball;
  let a = Math.floor((catchRate * bola) / 10);
  a = Math.floor((a * (maxHp * 3 - hp * 2)) / (3 * maxHp));
  if (status === "sleep" || status === "freeze") a *= 2;
  else if (status !== "none") a = Math.floor((a * 15) / 10);
  return a;
}

const raizInteira = (n: number) => Math.floor(Math.sqrt(n));

/** Chance de 0 a 1. */
export function catchChance(input: CaptureInput): number {
  if (input.ball === "master") return 1;
  const a = captureOdds(input);
  if (a > 254) return 1;
  if (a <= 0) return 0;
  const b = Math.floor(1048560 / raizInteira(raizInteira(Math.floor(16711680 / a))));
  return Math.min(1, b / 65536) ** 4;
}
