/**
 * Duas fichas lado a lado: números com quem está à frente, e a diferença de
 * dex — o que só um lado capturou é o que dá para trocar. Puro.
 */
import type { TrainerEntry } from "./trainerLog";
import { achievementsOf } from "./achievements";

export type RowKey = "owned" | "seen" | "badges" | "time" | "money" | "pc" | "achievements" | "topLevel";

export interface CompareRow {
  key: RowKey;
  /** `null` quando aquele save não registra o dado (dinheiro em R/S, p.ex.). */
  a: number | null;
  b: number | null;
  ahead: "a" | "b" | null;
}

export interface Comparison {
  rows: CompareRow[];
  onlyA: number[];
  onlyB: number[];
  both: number[];
}

const valores: Record<RowKey, (e: TrainerEntry) => number | null> = {
  owned: (e) => e.owned.length,
  seen: (e) => e.seen.length,
  badges: (e) => (e.trainer.badges ? e.trainer.badges.filter(Boolean).length : null),
  time: (e) => e.trainer.playTime.hours * 3600 + e.trainer.playTime.minutes * 60 + e.trainer.playTime.seconds,
  money: (e) => e.trainer.money,
  pc: (e) => e.boxes.reduce((n, c) => n + c.pokemon.length, 0),
  achievements: (e) => achievementsOf(e).filter((a) => a.done).length,
  topLevel: (e) => (e.party.length ? Math.max(...e.party.map((m) => m.level)) : null),
};

const ORDEM: RowKey[] = ["owned", "seen", "badges", "achievements", "topLevel", "pc", "time", "money"];

export function compareEntries(a: TrainerEntry, b: TrainerEntry): Comparison {
  const rows = ORDEM.map((key): CompareRow => {
    const va = valores[key](a);
    const vb = valores[key](b);
    const ahead = va === null || vb === null || va === vb ? null : va > vb ? "a" : "b";
    return { key, a: va, b: vb, ahead };
  });
  const sa = new Set(a.owned);
  const sb = new Set(b.owned);
  const num = (x: number, y: number) => x - y;
  return {
    rows,
    onlyA: [...sa].filter((n) => !sb.has(n)).sort(num),
    onlyB: [...sb].filter((n) => !sa.has(n)).sort(num),
    both: [...sa].filter((n) => sb.has(n)).sort(num),
  };
}
