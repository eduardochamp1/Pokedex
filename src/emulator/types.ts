import type { mGBAEmulator } from "@thenick775/mgba-wasm";

export type { mGBAEmulator };

/** Extensoes que o core aceita: Game Boy, Game Boy Color e Game Boy Advance. */
export const SUPPORTED_EXTENSIONS = [".gb", ".gbc", ".gba"] as const;

export const SUPPORTED_LABEL = "GB, GBC e GBA";

/** Quantos slots de save state a UI oferece. */
export const SAVE_STATE_SLOTS = [1, 2, 3, 4, 5, 6] as const;

export type SaveStateSlot = (typeof SAVE_STATE_SLOTS)[number];

export interface RomEntry {
  /** Nome do arquivo dentro do sistema de arquivos virtual do core. */
  fileName: string;
  /** De onde veio: escolhido pelo usuario ou lido da pasta local roms/. */
  origin: "upload" | "local";
}

export type EmulatorStatus =
  | { kind: "checking" }
  | { kind: "unsupported"; reason: string; detail: string }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "running"; rom: string }
  | { kind: "paused"; rom: string }
  | { kind: "error"; message: string };

export function isSupportedRom(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Rotulo legivel do console, a partir da extensao. */
export function consoleOf(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".gba")) return "Game Boy Advance";
  if (lower.endsWith(".gbc")) return "Game Boy Color";
  if (lower.endsWith(".gb")) return "Game Boy";
  return "desconhecido";
}
