/**
 * Os textos da ficha do treinador e da linha do tempo. Puro: o nome de cada
 * pokémon chega por uma função, para a página decidir de onde ele vem.
 */
import { HOENN_BADGES, HOENN_TOWNS } from "../data/hoenn";
import type { TrainerEvent } from "./trainerLog";

/** "45min", "2h 05min" — como o cartão de treinador do jogo, sem segundos. */
export function formatPlayTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds / 60) % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

export function formatMoney(value: number): string {
  return `₽${value.toLocaleString("pt-BR")}`;
}

/** O ID de treinador aparece no jogo com cinco dígitos. */
export function formatTrainerId(id: number): string {
  return String(id).padStart(5, "0");
}

const contar = (n: number, palavra: string) => `${n} ${palavra}${n === 1 ? "" : "s"}`;

export function describeEvent(e: TrainerEvent, nameOf: (national: number) => string): string {
  switch (e.kind) {
    case "start":
      return `Começou a registrar: ${contar(e.owned, "capturado")}, ${contar(e.seen, "visto")}`;
    case "captured":
      return `Capturou ${nameOf(e.national)}`;
    case "badge": {
      const b = HOENN_BADGES[e.index];
      return b ? `Ganhou a ${b.name} de ${b.leader}` : `Ganhou a insígnia ${e.index + 1}`;
    }
    case "town":
      return `Chegou a ${HOENN_TOWNS[e.index] ?? `cidade ${e.index + 1}`}`;
    case "level":
      return e.to - e.from === 1
        ? `${e.nickname} subiu para o nível ${e.to}`
        : `${e.nickname} subiu do nível ${e.from} para o ${e.to}`;
    case "evolved":
      return `${e.nickname} evoluiu de ${nameOf(e.from)} para ${nameOf(e.to)}`;
    case "rewind":
      return "Um save anterior foi carregado";
  }
}
