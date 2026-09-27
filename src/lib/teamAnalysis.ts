/**
 * Análise de tipo de um time de até seis. Pura, sem request: usa a mesma
 * matriz 18×18 de `data/typeMatchups` que o Comparar e a ficha usam.
 *
 * O ataque considera só os tipos dos membros, como se cada um usasse golpes
 * do próprio tipo (STAB). Os golpes de verdade de cada pokémon variam demais
 * para o time ser julgado por eles — isso é o que o treinador escolhe depois.
 */
import { attackMultiplier, type TypeName } from "../data/typeMatchups";
import { POKEMON_TYPES } from "../hooks/usePokemon";

export const MAX_TEAM = 6;

export interface TeamMember {
  name: string;
  types: TypeName[];
}

export interface DefenseRow {
  attacker: TypeName;
  weak: string[];
  resist: string[];
  immune: string[];
  /** Multiplicador em cada membro, pelo nome. */
  byMember: Record<string, number>;
  /** O pior multiplicador do time contra este tipo (4, 2, 1…). */
  worst: number;
  /**
   * Dois ou mais membros fracos, e mais fracos do que membros que resistem ou
   * são imunes: o time não tem quem entrar para receber o golpe.
   */
  danger: boolean;
}

export function defenseTable(team: TeamMember[]): DefenseRow[] {
  return (POKEMON_TYPES as readonly TypeName[]).map((attacker) => {
    const weak: string[] = [];
    const resist: string[] = [];
    const immune: string[] = [];
    const byMember: Record<string, number> = {};
    let worst = 0;
    for (const p of team) {
      const mult = attackMultiplier(attacker, p.types);
      byMember[p.name] = mult;
      worst = Math.max(worst, mult);
      if (mult === 0) immune.push(p.name);
      else if (mult > 1) weak.push(p.name);
      else if (mult < 1) resist.push(p.name);
    }
    const respostas = resist.length + immune.length;
    return {
      attacker,
      weak,
      resist,
      immune,
      byMember,
      worst,
      danger: weak.length >= 2 && weak.length > respostas,
    };
  });
}

export interface OffenseRow {
  defender: TypeName;
  /** O melhor multiplicador que algum tipo do time consegue. */
  best: number;
  /** Quem acerta super efetivo. */
  by: string[];
}

export function offenseCoverage(team: TeamMember[]): OffenseRow[] {
  return (POKEMON_TYPES as readonly TypeName[]).map((defender) => {
    let best = 0;
    const by: string[] = [];
    for (const p of team) {
      const melhorDele = Math.max(...p.types.map((t) => attackMultiplier(t, [defender])));
      best = Math.max(best, melhorDele);
      if (melhorDele > 1) by.push(p.name);
    }
    return { defender, best, by };
  });
}

export function teamGaps(team: TeamMember[]): { weakSpots: TypeName[]; uncovered: TypeName[] } {
  if (team.length === 0) return { weakSpots: [], uncovered: [] };
  return {
    weakSpots: defenseTable(team)
      .filter((r) => r.danger)
      .map((r) => r.attacker),
    uncovered: offenseCoverage(team)
      .filter((r) => r.best < 2)
      .map((r) => r.defender),
  };
}

/** `?time=mudkip,torchic` — nomes separados por vírgula, sem repetir, até seis. */
export function parseTeamParam(value: string | null): string[] {
  if (!value) return [];
  const nomes = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(nomes)].slice(0, MAX_TEAM);
}

export function toTeamParam(names: string[]): string {
  return names.join(",");
}
