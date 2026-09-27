/**
 * Que tipo de pokémon consertaria o time. Pura: pontua as 171 combinações de
 * tipo (18 simples e 153 duplas) contra os pontos fracos e a cobertura do
 * time, com a mesma matriz de `teamAnalysis`.
 */
import { attackMultiplier, type TypeName } from "../data/typeMatchups";
import { POKEMON_TYPES } from "../hooks/usePokemon";
import { defenseTable, teamGaps, type TeamMember } from "./teamAnalysis";

export interface TypeSuggestion {
  types: TypeName[];
  score: number;
  /** Pontos fracos do time que esta combinação resiste ou anula. */
  fixes: TypeName[];
  /** Tipos que ninguém acertava forte e esta combinação acerta (por STAB). */
  covers: TypeName[];
  /** Tipos que já tinham membro fraco e com ela virariam perigo. */
  worsens: TypeName[];
}

const TIPOS = POKEMON_TYPES as readonly TypeName[];

function combinacoes(): TypeName[][] {
  const out: TypeName[][] = TIPOS.map((t) => [t]);
  for (let i = 0; i < TIPOS.length; i++) for (let j = i + 1; j < TIPOS.length; j++) out.push([TIPOS[i], TIPOS[j]]);
  return out;
}

const mesmaCombinacao = (a: TypeName[], b: TypeName[]) =>
  a.length === b.length && a.every((t) => b.includes(t));

export function suggestTypes(team: TeamMember[], limit = 5): TypeSuggestion[] {
  if (team.length === 0) return [];
  const { weakSpots, uncovered } = teamGaps(team);
  const defesa = new Map(defenseTable(team).map((r) => [r.attacker, r]));

  const out: TypeSuggestion[] = [];
  for (const types of combinacoes()) {
    if (team.some((m) => mesmaCombinacao(m.types, types))) continue;
    let score = 0;
    const fixes: TypeName[] = [];
    const covers: TypeName[] = [];
    const worsens: TypeName[] = [];

    for (const w of weakSpots) {
      const m = attackMultiplier(w, types);
      if (m === 0) score += 4;
      else if (m < 1) score += 3;
      else if (m > 1) score -= 3;
      if (m < 1) fixes.push(w);
    }
    for (const u of uncovered) {
      if (Math.max(...types.map((t) => attackMultiplier(t, [u]))) >= 2) {
        score += 2;
        covers.push(u);
      }
    }
    // Fraqueza nova só pesa quando empurra o time para o perigo.
    for (const a of TIPOS) {
      if (weakSpots.includes(a) || attackMultiplier(a, types) <= 1) continue;
      const r = defesa.get(a);
      if (r && r.weak.length + 1 >= 2 && r.weak.length + 1 > r.resist.length + r.immune.length) {
        score -= 1;
        worsens.push(a);
      }
    }
    if (score > 0) out.push({ types, score, fixes, covers, worsens });
  }
  // Empate: a combinação com menos fraquezas próprias primeiro.
  const fraquezas = (ts: TypeName[]) => TIPOS.filter((a) => attackMultiplier(a, ts) > 1).length;
  out.sort((a, b) => b.score - a.score || fraquezas(a.types) - fraquezas(b.types));
  return out.slice(0, limit);
}

/**
 * Espécies com exatamente essa combinação, a partir das listas de `/type/{x}`.
 * Só formas base (id da dex até 10000), em ordem de dex, até `maxNational`.
 */
export function speciesForCombo(
  types: TypeName[],
  lists: Record<string, string[] | undefined>,
  idOf: Record<string, number> | Map<string, number>,
  maxNational = Infinity
): string[] {
  const id = (n: string) => (idOf instanceof Map ? idOf.get(n) : idOf[n]);
  const [a, b] = types;
  const la = lists[a] ?? [];
  let nomes: string[];
  if (b) {
    const lb = new Set(lists[b] ?? []);
    nomes = la.filter((n) => lb.has(n));
  } else {
    // Tipo simples: fora quem aparece em qualquer outra lista carregada.
    const outros = new Set(
      Object.entries(lists)
        .filter(([t]) => t !== a)
        .flatMap(([, l]) => l ?? [])
    );
    nomes = la.filter((n) => !outros.has(n));
  }
  return nomes
    .filter((n) => {
      const i = id(n);
      return i !== undefined && i < 10000 && i <= maxNational;
    })
    .sort((x, y) => (id(x) ?? 0) - (id(y) ?? 0));
}
