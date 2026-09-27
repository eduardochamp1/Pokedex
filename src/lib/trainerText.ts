/**
 * Os textos da ficha do treinador e da linha do tempo. Puro: o nome de cada
 * pokémon chega por uma função, para a página decidir de onde ele vem.
 */
import { HOENN_TOWNS } from "../data/hoenn";
import { badgesOf } from "./gen3Game";
import { achievementById } from "./achievements";
import type { Gen3Game } from "../emulator/saveParse/gen3";
import type { TrainerEvent } from "./trainerLog";
import { getLang, localeOf, type Lang } from "../i18n/lang";

/** "45min", "2h 05min" — como o cartão de treinador do jogo, sem segundos. */
export function formatPlayTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds / 60) % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

export function formatMoney(value: number, lang: Lang = getLang()): string {
  return `₽${value.toLocaleString(localeOf(lang))}`;
}

/** O ID de treinador aparece no jogo com cinco dígitos. */
export function formatTrainerId(id: number): string {
  return String(id).padStart(5, "0");
}

const contar = (n: number, palavra: string) => `${n} ${palavra}${n === 1 ? "" : "s"}`;

export function describeEvent(
  e: TrainerEvent,
  nameOf: (national: number) => string,
  lang: Lang = getLang(),
  game: Gen3Game = "emerald"
): string {
  const en = lang === "en";
  switch (e.kind) {
    case "start":
      return en
        ? `Started recording: ${e.owned} caught, ${e.seen} seen`
        : `Começou a registrar: ${contar(e.owned, "capturado")}, ${contar(e.seen, "visto")}`;
    case "captured":
      return en ? `Caught ${nameOf(e.national)}` : `Capturou ${nameOf(e.national)}`;
    case "badge": {
      const b = badgesOf(game)[e.index];
      if (en) return b ? `Earned ${b.leader}'s ${b.name}` : `Earned badge ${e.index + 1}`;
      return b ? `Ganhou a ${b.name} de ${b.leader}` : `Ganhou a insígnia ${e.index + 1}`;
    }
    case "town": {
      const nome = HOENN_TOWNS[e.index];
      if (en) return `Reached ${nome ?? `town ${e.index + 1}`}`;
      return `Chegou a ${nome ?? `cidade ${e.index + 1}`}`;
    }
    case "level":
      if (en) {
        return e.to - e.from === 1
          ? `${e.nickname} grew to level ${e.to}`
          : `${e.nickname} grew from level ${e.from} to ${e.to}`;
      }
      return e.to - e.from === 1
        ? `${e.nickname} subiu para o nível ${e.to}`
        : `${e.nickname} subiu do nível ${e.from} para o ${e.to}`;
    case "evolved":
      return en
        ? `${e.nickname} evolved from ${nameOf(e.from)} into ${nameOf(e.to)}`
        : `${e.nickname} evoluiu de ${nameOf(e.from)} para ${nameOf(e.to)}`;
    case "achievement": {
      const a = achievementById(e.id);
      const nome = a ? (en ? a.title.en : a.title.pt) : e.id;
      return en ? `Achievement: ${nome}` : `Conquista: ${nome}`;
    }
    case "rewind":
      return en ? "An earlier save was loaded" : "Um save anterior foi carregado";
  }
}
