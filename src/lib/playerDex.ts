/**
 * A dex do jogador, lida do save de Gen 3 e guardada para o resto do site.
 *
 * O save só existe dentro do core do emulador, e o core só existe em `/jogar`.
 * A Home precisa saber o que o jogador pegou **sem** carregar o core (~1,8 MB)
 * — então quem lê o save grava aqui, no `localStorage`, e a Home lê daqui.
 *
 * Uma entrada por ROM, e vale a gravada por último: quem alterna entre dois
 * jogos vê a dex do que jogou agora. Escolher entre elas ficou fora, de
 * propósito, até alguém precisar.
 */
import { useSyncExternalStore } from "react";

export interface PlayerDexEntry {
  /** Nome do arquivo da ROM, que é como o site identifica o jogo. */
  rom: string;
  playerName: string;
  /** Números nacionais, crescentes. `owned` está contido em `seen`. */
  seen: number[];
  owned: number[];
  updatedAt: number;
}

export type DexMark = "owned" | "seen";

export const DEX_FILTERS = [
  { id: "capturados", label: "Capturados", labelEn: "Caught" },
  { id: "vistos", label: "Vistos, não capturados", labelEn: "Seen, not caught" },
  { id: "faltam", label: "Não vistos", labelEn: "Not seen" },
] as const;

export type DexFilter = (typeof DEX_FILTERS)[number]["id"];

/** Tamanho da dex nacional que um jogo de Gen 3 consegue marcar. */
export const TOTAL_DA_DEX_GEN3 = 386;

const KEY = "pokedex:player-dex";

const isNumeros = (v: unknown): v is number[] =>
  Array.isArray(v) &&
  v.every((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_DA_DEX_GEN3);

function isEntry(v: unknown): v is PlayerDexEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.rom === "string" &&
    typeof e.playerName === "string" &&
    isNumeros(e.seen) &&
    isNumeros(e.owned) &&
    typeof e.updatedAt === "number"
  );
}

/**
 * Lê e valida. O que foi gravado por outra versão do site com outra forma é
 * descartado entrada por entrada, em vez de derrubar a Home.
 */
function load(): Record<string, PlayerDexEntry> {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return {};
  }
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, PlayerDexEntry> = {};
    for (const [rom, entry] of Object.entries(parsed)) {
      if (isEntry(entry) && entry.rom === rom) out[rom] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

function maisRecente(entradas: Record<string, PlayerDexEntry>): PlayerDexEntry | null {
  let melhor: PlayerDexEntry | null = null;
  for (const e of Object.values(entradas)) {
    if (!melhor || e.updatedAt > melhor.updatedAt) melhor = e;
  }
  return melhor;
}

let entradas: Record<string, PlayerDexEntry> = {};
let latest: PlayerDexEntry | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Relê do `localStorage`. Usado ao iniciar e quando outra aba grava. */
export function reloadPlayerDex(): void {
  entradas = load();
  latest = maisRecente(entradas);
  emit();
}

reloadPlayerDex();

/** Grava a dex de uma ROM. Falhar em gravar não pode quebrar o jogo. */
export function recordPlayerDex(
  rom: string,
  playerName: string,
  pokedex: { seen: number[]; owned: number[] },
  now: number = Date.now()
): void {
  const entry: PlayerDexEntry = {
    rom,
    playerName,
    seen: [...pokedex.seen],
    owned: [...pokedex.owned],
    updatedAt: now,
  };
  entradas = { ...entradas, [rom]: entry };
  latest = maisRecente(entradas);
  try {
    localStorage.setItem(KEY, JSON.stringify(entradas));
  } catch {
    // sem localStorage: a dex vale só nesta aba
  }
  emit();
}

export function latestPlayerDex(): PlayerDexEntry | null {
  return latest;
}

function subscribe(l: () => void) {
  listeners.add(l);
  // Outra aba (a do emulador, por exemplo) gravou: relê.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) reloadPlayerDex();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePlayerDex(): PlayerDexEntry | null {
  return useSyncExternalStore(subscribe, latestPlayerDex, () => null);
}

export function dexMarkOf(
  entry: PlayerDexEntry | null,
  national: number
): DexMark | undefined {
  if (!entry) return undefined;
  if (entry.owned.includes(national)) return "owned";
  if (entry.seen.includes(national)) return "seen";
  return undefined;
}

/**
 * Os números nacionais de cada filtro.
 *
 * "vistos" exclui os capturados: quem quer ver o que falta pegar não precisa
 * rever o que já tem. "faltam" se limita a 1–386 porque é a dex que um jogo de
 * Gen 3 tem — um Lucario não "falta" em Emerald, ele não existe lá.
 */
export function nationalsFor(entry: PlayerDexEntry, filtro: DexFilter): number[] {
  if (filtro === "capturados") return [...entry.owned];
  const capturados = new Set(entry.owned);
  if (filtro === "vistos") return entry.seen.filter((n) => !capturados.has(n));
  const vistos = new Set(entry.seen);
  const faltam: number[] = [];
  for (let n = 1; n <= TOTAL_DA_DEX_GEN3; n++) if (!vistos.has(n)) faltam.push(n);
  return faltam;
}

export function parseDexFilter(value: string | null | undefined): DexFilter | undefined {
  return DEX_FILTERS.some((f) => f.id === value) ? (value as DexFilter) : undefined;
}
