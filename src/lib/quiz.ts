/**
 * "Quem é esse Pokémon?" — sorteio das rodadas e o recorde.
 *
 * O aleatório entra por parâmetro para o teste poder fixá-lo; a página passa
 * `Math.random`.
 */

export type QuizGen = number | "all";

/** Primeiro e último número nacional de cada geração. */
export const GEN_RANGES: [number, number][] = [
  [1, 151],
  [152, 251],
  [252, 386],
  [387, 493],
  [494, 649],
  [650, 721],
  [722, 809],
  [810, 905],
  [906, 1025],
];

export function poolFor(gen: QuizGen): number[] {
  const [ini, fim] = gen === "all" ? [1, 1025] : GEN_RANGES[gen - 1];
  return Array.from({ length: fim - ini + 1 }, (_, i) => ini + i);
}

export function parseQuizGen(value: string | null): QuizGen {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 9 ? n : "all";
}

export interface Round {
  answer: number;
  options: number[];
}

const sortear = (lista: number[], rand: () => number) => lista[Math.floor(rand() * lista.length)];

/**
 * Uma rodada: a resposta e mais três do mesmo recorte, embaralhadas. Evita
 * repetir a resposta da rodada anterior — duas iguais seguidas parecem bug.
 */
export function makeRound(pool: number[], rand: () => number, previous?: number): Round {
  const candidatos = pool.length > 1 ? pool.filter((n) => n !== previous) : pool;
  const answer = sortear(candidatos, rand);
  const opcoes = new Set([answer]);
  while (opcoes.size < Math.min(4, pool.length)) opcoes.add(sortear(pool, rand));
  // Fisher–Yates: a resposta não fica sempre na primeira posição.
  const options = [...opcoes];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { answer, options };
}

const KEY = "pokedex:quiz-best";

function lerTudo(): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function loadBest(gen: QuizGen): number {
  const v = lerTudo()[String(gen)];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** Grava só se for maior. Sem localStorage, o recorde vale só nesta visita. */
export function saveBest(gen: QuizGen, streak: number): void {
  const tudo = lerTudo();
  if (streak <= (tudo[String(gen)] ?? 0)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...tudo, [String(gen)]: streak }));
  } catch {
    // sem localStorage
  }
}
