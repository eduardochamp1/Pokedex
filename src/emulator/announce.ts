/**
 * O que dizer ao leitor de tela quando o emulador muda de estado, e o nome
 * de cada botão do controle virtual. Puro.
 *
 * Erro e navegador sem suporte ficam de fora: já aparecem num `role="alert"`
 * próprio, e anunciar duas vezes só atrapalha.
 */
import type { EmulatorStatus } from "./types";
import type { Lang } from "../i18n/lang";

const semExtensao = (rom: string) => rom.replace(/\.[^.]+$/, "");

export function statusAnnouncement(prev: EmulatorStatus | null, next: EmulatorStatus, lang: Lang): string {
  if (!prev) return "";
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);
  const jogando = (rom: string) => t(`Jogando ${semExtensao(rom)}.`, `Playing ${semExtensao(rom)}.`);

  if (next.kind === "running") {
    if (prev.kind === "paused" && prev.rom === next.rom) return t("Continuando.", "Resuming.");
    if (prev.kind === "running" && prev.rom === next.rom) return "";
    return jogando(next.rom);
  }
  if (next.kind === "paused" && prev.kind === "running") return t("Pausado.", "Paused.");
  if (next.kind === "loading" && prev.kind !== "loading") return t("Carregando o emulador…", "Loading the emulator…");
  if (next.kind === "ready") {
    if (prev.kind === "running" || prev.kind === "paused") return t("Jogo fechado.", "Game closed.");
    if (prev.kind === "loading" || prev.kind === "checking") return t("Emulador pronto. Escolha um jogo.", "Emulator ready. Pick a game.");
  }
  return "";
}

const DIRECIONAL: Record<string, [string, string]> = {
  Up: ["Cima", "Up"],
  Down: ["Baixo", "Down"],
  Left: ["Esquerda", "Left"],
  Right: ["Direita", "Right"],
};

/** A, B, L, R, Start e Select são nomes do console e ficam como estão. */
export function padLabel(button: string, lang: Lang): string {
  const d = DIRECIONAL[button];
  return d ? (lang === "en" ? d[1] : d[0]) : button;
}
