/** Agrupar e filtrar a linha do tempo dos jogos. Puro. */
import type { TimelineGame } from "../data/gameTimeline";
import { isPlayable } from "../emulator/playable";

export interface TimelineFilter {
  playableOnly: boolean;
  remakes: "all" | "only" | "none";
  generation: number | "all";
}

export function filterGames(games: TimelineGame[], f: TimelineFilter): TimelineGame[] {
  return games.filter(
    (g) =>
      (!f.playableOnly || isPlayable(g.versionGroup)) &&
      (f.remakes === "all" || (f.remakes === "only") === Boolean(g.remake)) &&
      (f.generation === "all" || g.generation === f.generation)
  );
}

export function byYear(games: TimelineGame[]): { year: number; games: TimelineGame[] }[] {
  const out: { year: number; games: TimelineGame[] }[] = [];
  for (const g of [...games].sort((a, b) => a.year - b.year)) {
    const ultimo = out[out.length - 1];
    if (ultimo?.year === g.year) ultimo.games.push(g);
    else out.push({ year: g.year, games: [g] });
  }
  return out;
}
