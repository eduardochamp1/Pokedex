/**
 * O seu time contra o time de um líder de ginásio, golpe a golpe. Puro: os
 * tipos e golpes de Gen 3 já chegam resolvidos (os do líder vêm prontos em
 * `data/gymLeaders`, os seus a página busca na PokéAPI).
 */
import type { TypeName } from "../data/typeMatchups";
import type { Gym, GymMon, GymMove } from "../data/gymLeaders";
import { gen3TypeMultiplier } from "./gen3Damage";

export interface BattleMember {
  name: string;
  national: number;
  level: number;
  types: TypeName[];
  moves: GymMove[];
}

export interface Matchup {
  /** O melhor multiplicador de um golpe de dano seu. `null`: nenhum golpe de dano. */
  offense: { mult: number | null; move?: string };
  /** O pior multiplicador de um golpe de dano dele contra você. */
  defense: { mult: number | null; move?: string };
}

const deDano = (moves: GymMove[]) => moves.filter((m) => m.power !== null && m.power > 0);

function melhor(moves: GymMove[], alvo: TypeName[]): { mult: number | null; move?: string } {
  let out: { mult: number | null; move?: string } = { mult: null };
  for (const m of deDano(moves)) {
    const mult = gen3TypeMultiplier(m.type, alvo);
    if (out.mult === null || mult > out.mult) out = { mult, move: m.slug };
  }
  return out;
}

export function matchup(member: BattleMember, mon: GymMon): Matchup {
  return { offense: melhor(member.moves, mon.types), defense: melhor(mon.moves, member.types) };
}

export interface GymRank {
  member: BattleMember;
  score: number;
  matchups: Matchup[];
}

/**
 * Quem levar: somatório, pokémon a pokémon do líder, de quanto você bate e de
 * quanto apanha. Só tipos — nível e status ficam para a calculadora de dano.
 */
export function rankForGym(team: BattleMember[], gym: Gym): GymRank[] {
  return team
    .map((member) => {
      const matchups = gym.party.map((mon) => matchup(member, mon));
      let score = 0;
      for (const { offense, defense } of matchups) {
        const o = offense.mult;
        if (o !== null) score += o >= 4 ? 3 : o >= 2 ? 2 : o === 0 ? -2 : o < 1 ? -1 : 0;
        const d = defense.mult;
        if (d !== null) score += d >= 4 ? -3 : d >= 2 ? -2 : d === 0 ? 2 : d < 1 ? 1 : 0;
      }
      return { member, score, matchups };
    })
    .sort((a, b) => b.score - a.score);
}

/** Índice do primeiro ginásio sem insígnia; `null` com as oito. */
export function nextGym(badges: boolean[] | null): number | null {
  if (!badges) return 0;
  const i = badges.findIndex((b) => !b);
  return i < 0 ? null : i;
}
