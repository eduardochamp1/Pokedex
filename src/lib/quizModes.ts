/**
 * Os modos do quiz além da silhueta, e o desafio do dia.
 *
 * O desafio do dia é o mesmo para todo mundo, sem servidor: o sorteio usa um
 * gerador com semente (mulberry32) cuja semente é o número do dia — como o
 * pokémon do dia em `daily.ts`.
 */
import { POKEMON_TYPES } from "../hooks/usePokemon";
import { makeRound, poolFor, type Round } from "./quiz";
import type { Lang } from "../i18n/lang";

export type QuizMode = "silhueta" | "grito" | "descricao" | "tipo" | "diario";
export type RoundMode = Exclude<QuizMode, "diario">;

const MODOS: QuizMode[] = ["silhueta", "grito", "descricao", "tipo", "diario"];

export function parseQuizMode(value: string | null): QuizMode {
  return MODOS.includes(value as QuizMode) ? (value as QuizMode) : "silhueta";
}

/** mulberry32: pequeno, rápido e bom o bastante para sortear rodadas. */
export function seededRandom(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DAILY_ROUNDS = 5;
/** A ordem dos modos no desafio: começa e termina pela silhueta. */
const ORDEM_DO_DIA: RoundMode[] = ["silhueta", "grito", "descricao", "tipo", "silhueta"];

export function dailyRounds(day: number): { mode: RoundMode; round: Round }[] {
  const rand = seededRandom(day);
  const pool = poolFor("all");
  const usados = new Set<number>();
  return ORDEM_DO_DIA.map((mode) => {
    let round = makeRound(pool, rand);
    while (usados.has(round.answer)) round = makeRound(pool, rand);
    usados.add(round.answer);
    return { mode, round };
  });
}

/** A combinação certa e mais três, distintas, em ordem sorteada. */
export function typeOptions(answer: string[], rand: () => number): string[][] {
  const chave = (ts: string[]) => [...ts].sort().join("/");
  const vistas = new Set([chave(answer)]);
  const out: string[][] = [answer];
  const tipos = POKEMON_TYPES as readonly string[];
  while (out.length < 4) {
    const a = tipos[Math.floor(rand() * tipos.length)];
    // Metade das vezes, dupla — como a resposta costuma ser.
    const b = rand() < 0.5 ? tipos[Math.floor(rand() * tipos.length)] : undefined;
    const combo = b && b !== a ? [a, b] : [a];
    if (vistas.has(chave(combo))) continue;
    vistas.add(chave(combo));
    out.push(combo);
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Troca o nome da espécie por ▢▢▢ no texto da Pokédex, palavra inteira. */
export function redactName(text: string, names: string[]): string {
  let out = text;
  for (const n of [...names].sort((a, b) => b.length - a.length)) {
    const variantes = [n, n.replace(/-/g, " ")];
    for (const v of variantes) {
      out = out.replace(new RegExp(`(?<![\\p{L}\\d])${escapar(v)}(?![\\p{L}\\d])`, "giu"), "▢▢▢");
    }
  }
  return out;
}

const KEY = "pokedex:quiz-daily";

/** O resultado do desafio de `day`, ou `null` se ainda não jogou. */
export function loadDaily(day: number): boolean[] | null {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (v && typeof v === "object" && (v as { day?: unknown }).day === day) {
      const r = (v as { results?: unknown }).results;
      if (Array.isArray(r) && r.every((x) => typeof x === "boolean")) return r;
    }
  } catch {
    // sem localStorage ou lixo: como se não tivesse jogado
  }
  return null;
}

/** Só o dia corrente fica guardado. */
export function saveDaily(day: number, results: boolean[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ day, results }));
  } catch {
    // sem localStorage: vale só nesta visita
  }
}

export function shareText(day: number, results: boolean[], lang: Lang): string {
  const d = new Date(day * 86_400_000);
  const [a, m, dd] = [d.getUTCFullYear(), String(d.getUTCMonth() + 1).padStart(2, "0"), String(d.getUTCDate()).padStart(2, "0")];
  const data = lang === "en" ? `${a}-${m}-${dd}` : `${dd}/${m}/${a}`;
  const nota = `${results.filter(Boolean).length}/${results.length}`;
  const quadrados = results.map((r) => (r ? "🟩" : "🟥")).join("");
  return lang === "en" ? `Pokédex Quiz ${data} — ${nota}\n${quadrados}` : `Quiz Pokédex ${data} — ${nota}\n${quadrados}`;
}
