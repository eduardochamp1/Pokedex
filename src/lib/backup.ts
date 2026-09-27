/**
 * Levar os dados do site para outro aparelho, sem servidor: tudo o que o site
 * guarda no `localStorage` vai para um arquivo `.json`, e o arquivo volta no
 * outro navegador.
 *
 * Fica de fora a última ROM aberta, que aponta para um arquivo que só existe
 * neste aparelho. Os saves do emulador também não vêm — vivem no IndexedDB e
 * já têm o backup em disco de `/jogar`.
 */

export interface Backup {
  app: "pokedex";
  version: 1;
  exportedAt: string;
  /** Chave do localStorage -> valor, como está guardado. */
  data: Record<string, string>;
}

interface StorageLike {
  readonly length: number;
  key(i: number): string | null;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const FORA = new Set(["pokedex:emulator:last-rom"]);

/** As chaves que são do site: o prefixo, e o carrinho do Comparar, que é anterior a ele. */
export function isSiteKey(k: string): boolean {
  return (k.startsWith("pokedex:") || k === "comparator-cart") && !FORA.has(k);
}

function chaves(s: StorageLike): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k !== null) out.push(k);
  }
  return out;
}

export function collectBackup(s: StorageLike, now: Date = new Date()): Backup {
  const data: Record<string, string> = {};
  for (const k of chaves(s)) {
    const v = s.getItem(k);
    if (isSiteKey(k) && v !== null) data[k] = v;
  }
  return { app: "pokedex", version: 1, exportedAt: now.toISOString(), data };
}

/** `null` para qualquer coisa que não seja um backup deste site nesta versão. */
export function parseBackup(text: string): Backup | null {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    return null;
  }
  if (!v || typeof v !== "object") return null;
  const b = v as Record<string, unknown>;
  if (b.app !== "pokedex" || b.version !== 1 || typeof b.exportedAt !== "string") return null;
  if (!b.data || typeof b.data !== "object") return null;
  const data = b.data as Record<string, unknown>;
  for (const [k, val] of Object.entries(data)) {
    if (!isSiteKey(k) || typeof val !== "string") return null;
  }
  return { app: "pokedex", version: 1, exportedAt: b.exportedAt, data: data as Record<string, string> };
}

/** Troca os dados do site pelos do backup. O que não é do site fica como está. */
export function applyBackup(s: StorageLike, b: Backup): void {
  for (const k of chaves(s)) if (isSiteKey(k)) s.removeItem(k);
  for (const [k, v] of Object.entries(b.data)) s.setItem(k, v);
}

export interface BackupSummary {
  favorites: number;
  trainerCards: number;
  playerDexes: number;
  /** Chaves restantes: preferências, recordes, atalhos. */
  other: number;
}

export function summarize(data: Record<string, string>): BackupSummary {
  const contar = (k: string, comoLista: boolean) => {
    try {
      const v: unknown = JSON.parse(data[k] ?? "null");
      if (comoLista) return Array.isArray(v) ? v.length : 0;
      return v && typeof v === "object" ? Object.keys(v).length : 0;
    } catch {
      return 0;
    }
  };
  const conhecidas = ["pokedex:favorites", "pokedex:trainer-log", "pokedex:player-dex"];
  return {
    favorites: contar("pokedex:favorites", true),
    trainerCards: contar("pokedex:trainer-log", false),
    playerDexes: contar("pokedex:player-dex", false),
    other: Object.keys(data).filter((k) => !conhecidas.includes(k)).length,
  };
}

export function backupFileName(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `pokedex-dados-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}
