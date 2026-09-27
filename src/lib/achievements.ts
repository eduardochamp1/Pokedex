/**
 * Conquistas tiradas da ficha do treinador. Puro: tudo sai da `TrainerEntry`
 * que `trainerLog` já guarda — nada é gravado à parte.
 *
 * Uma conquista que depende do que o jogo não registra (insígnias em
 * Ruby/Sapphire, cidades fora do Emerald) não aparece, em vez de aparecer
 * eternamente pendente.
 */
import type { TrainerEntry } from "./trainerLog";
import { boxMonLevel } from "./pcBoxes";

export interface Achievement {
  id: string;
  title: { pt: string; en: string };
  description: { pt: string; en: string };
}

export interface AchievementState extends Achievement {
  have: number;
  need: number;
  done: boolean;
}

interface Def extends Achievement {
  /** `null` = não se aplica a este jogo. */
  measure: (e: TrainerEntry) => { have: number; need: number } | null;
}

const segundos = (e: TrainerEntry) =>
  e.trainer.playTime.hours * 3600 + e.trainer.playTime.minutes * 60 + e.trainer.playTime.seconds;

const noPc = (e: TrainerEntry) => e.boxes.flatMap((c) => c.pokemon);

const maiorNivel = (e: TrainerEntry) =>
  Math.max(0, ...e.party.map((m) => m.level), ...noPc(e).map((m) => boxMonLevel(m) ?? 0));

const dex = (n: number): Def => ({
  id: `dex-${n}`,
  title: { pt: `${n} capturados`, en: `${n} caught` },
  description: { pt: `Registre ${n} espécies como capturadas na Pokédex.`, en: `Register ${n} species as caught in the Pokédex.` },
  measure: (e) => ({ have: e.owned.length, need: n }),
});

const nivel = (n: number): Def => ({
  id: `level-${n}`,
  title: { pt: `Nível ${n}`, en: `Level ${n}` },
  description: { pt: `Tenha um pokémon no nível ${n}, no time ou no PC.`, en: `Have a Pokémon at level ${n}, in the team or the PC.` },
  measure: (e) => ({ have: Math.min(maiorNivel(e), n), need: n }),
});

const DEFS: Def[] = [
  dex(10),
  dex(50),
  dex(100),
  dex(200),
  {
    id: "badge-1",
    title: { pt: "Primeira insígnia", en: "First badge" },
    description: { pt: "Vença o primeiro líder de ginásio.", en: "Beat the first gym leader." },
    measure: (e) => (e.trainer.badges ? { have: Math.min(e.trainer.badges.filter(Boolean).length, 1), need: 1 } : null),
  },
  {
    id: "badge-8",
    title: { pt: "Todas as insígnias", en: "All badges" },
    description: { pt: "Junte as oito insígnias da região.", en: "Collect all eight badges of the region." },
    measure: (e) => (e.trainer.badges ? { have: e.trainer.badges.filter(Boolean).length, need: 8 } : null),
  },
  {
    id: "towns-all",
    title: { pt: "Hoenn inteira", en: "All of Hoenn" },
    description: { pt: "Visite as 16 cidades de Hoenn.", en: "Visit all 16 towns of Hoenn." },
    measure: (e) => (e.trainer.visitedTowns ? { have: e.trainer.visitedTowns.length, need: 16 } : null),
  },
  {
    id: "team-6",
    title: { pt: "Time completo", en: "Full team" },
    description: { pt: "Ande com seis pokémon no time.", en: "Carry six Pokémon in your team." },
    measure: (e) => ({ have: e.party.length, need: 6 }),
  },
  nivel(50),
  nivel(100),
  {
    id: "evolved",
    title: { pt: "Evolução", en: "Evolution" },
    description: { pt: "Veja um pokémon do time evoluir.", en: "See a team Pokémon evolve." },
    measure: (e) => ({ have: e.events.some((ev) => ev.kind === "evolved") ? 1 : 0, need: 1 }),
  },
  {
    id: "shiny",
    title: { pt: "Brilhante", en: "Shiny" },
    description: { pt: "Tenha um pokémon shiny, no time ou no PC.", en: "Own a shiny Pokémon, in the team or the PC." },
    measure: (e) => ({ have: [...e.party, ...noPc(e)].some((m) => m.shiny) ? 1 : 0, need: 1 }),
  },
  {
    id: "box-full",
    title: { pt: "Caixa cheia", en: "Full box" },
    description: { pt: "Encha uma caixa do PC com 30 pokémon.", en: "Fill a PC box with 30 Pokémon." },
    measure: (e) => ({ have: Math.max(0, ...e.boxes.map((c) => c.pokemon.length)), need: 30 }),
  },
  {
    id: "time-10h",
    title: { pt: "Dez horas", en: "Ten hours" },
    description: { pt: "Passe de 10 horas de jogo.", en: "Play for more than 10 hours." },
    measure: (e) => ({ have: Math.min(Math.floor(segundos(e) / 3600), 10), need: 10 }),
  },
  {
    id: "money-100k",
    title: { pt: "₽100.000", en: "₽100,000" },
    description: { pt: "Junte ₽100.000 de uma vez.", en: "Hold ₽100,000 at once." },
    measure: (e) => (e.trainer.money === null ? null : { have: Math.min(e.trainer.money, 100_000), need: 100_000 }),
  },
];

export const ACHIEVEMENTS: Achievement[] = DEFS.map(({ id, title, description }) => ({ id, title, description }));

export function achievementsOf(e: TrainerEntry): AchievementState[] {
  const out: AchievementState[] = [];
  for (const d of DEFS) {
    const m = d.measure(e);
    if (!m) continue;
    out.push({ id: d.id, title: d.title, description: d.description, have: m.have, need: m.need, done: m.have >= m.need });
  }
  return out;
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Os ids que estão feitos em `next` e não estavam em `prev`. */
export function newlyDone(prev: TrainerEntry, next: TrainerEntry): string[] {
  const antes = new Set(achievementsOf(prev).filter((a) => a.done).map((a) => a.id));
  return achievementsOf(next)
    .filter((a) => a.done && !antes.has(a.id))
    .map((a) => a.id);
}
