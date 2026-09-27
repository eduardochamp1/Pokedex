import { getLang, type Lang } from "../i18n/lang";
import type { mGBAEmulator as mGBABase } from "@thenick775/mgba-wasm";

/**
 * O core, com as duas funcoes que as typings da 2.5.0 esqueceram.
 *
 * `saveStateSlot` e `loadStateSlot` existem no `mgba.js` da 2.5.0 — conferido
 * no proprio arquivo, as duas sao `cwrap` de exports do wasm. Elas so entraram
 * no `.d.ts` na 2.5.1, e a 2.5.1 e justamente a versao que nao podemos usar:
 * ela quebrou o `setFastForwardMultiplier`. Ver `mgbaDefaults.ts`.
 *
 * Declarar aqui em vez de subir de versao e o preco de ficar na 2.5.0, e ele e
 * pequeno: duas assinaturas, contra o turbo inteiro.
 */
export type mGBAEmulator = mGBABase & {
  saveStateSlot(slot: number, flags?: number): boolean;
  loadStateSlot(slot: number, flags?: number): boolean;
};

/** Extensoes que o core aceita: Game Boy, Game Boy Color e Game Boy Advance. */
export const SUPPORTED_EXTENSIONS = [".gb", ".gbc", ".gba"] as const;

export const SUPPORTED_LABEL = "GB, GBC e GBA";
export const SUPPORTED_LABEL_EN = "GB, GBC and GBA";

/** Quantos slots de save state a UI oferece. */
export const SAVE_STATE_SLOTS = [1, 2, 3, 4, 5, 6] as const;

export type SaveStateSlot = (typeof SAVE_STATE_SLOTS)[number];

export interface RomEntry {
  /**
   * Jogo-base lido do cabecalho do cartucho, quando reconhecido.
   *
   * E "base" e nao "jogo": romhack tem cabecalho identico ao do original, entao
   * quem manda na linha principal continua sendo o nome do arquivo.
   */
  base?: string;
  /**
   * Grupo de versao do jogo-base, nos ids de src/data/versionGroups.ts.
   *
   * E por ele que /jogar?jogo=emerald encontra a ROM certa na biblioteca. Nao
   * serve como chave de nada que persista: dois romhacks de FireRed casariam
   * no mesmo id.
   */
  versionGroupId?: string;
  /** Nome do arquivo dentro do sistema de arquivos virtual do core. */
  fileName: string;
  /** De onde veio: escolhido pelo usuario ou lido da pasta local roms/. */
  origin: "upload" | "local";
  /**
   * Bytes que ocupa no IndexedDB. A biblioteca so crescia e nao havia como
   * saber o custo — sao 16 a 32 MB por jogo de GBA.
   */
  size?: number;
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
export function consoleOf(fileName: string, lang: Lang = getLang()): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".gba")) return "Game Boy Advance";
  if (lower.endsWith(".gbc")) return "Game Boy Color";
  if (lower.endsWith(".gb")) return "Game Boy";
  return lang === "en" ? "unknown" : "desconhecido";
}
