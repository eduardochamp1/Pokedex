/**
 * Durabilidade dos saves.
 *
 * O core guarda tudo em IndexedDB (IDBFS): saves de bateria, save states e as
 * ROMs enviadas. Isso NAO e cache HTTP — sobrevive a recarregar a pagina e a
 * fechar o navegador. Mas tambem nao e garantido:
 *
 *  - por padrao o navegador trata o armazenamento como "best-effort" e pode
 *    descartar sob pressao de disco;
 *  - "limpar dados do site" apaga;
 *  - e por navegador e por perfil — nao sincroniza entre maquinas.
 *
 * Duas defesas, aqui:
 *  1. pedir armazenamento persistente (isenta a origem do descarte automatico);
 *  2. espelhar os saves numa pasta `saves/` de verdade, no disco, via o
 *     endpoint PUT do plugin de dev. Essa e a garantia forte: arquivo em disco
 *     nao depende de politica de navegador.
 */

export interface StorageStatus {
  /** O navegador prometeu nao descartar? */
  persistent: boolean;
  /** A API existe neste navegador? */
  supported: boolean;
  usageBytes?: number;
  quotaBytes?: number;
}

/**
 * Pede armazenamento persistente e devolve o estado resultante.
 *
 * Chrome costuma negar em site sem "engajamento" (sem instalar como app, sem
 * visitas repetidas), e negar e normal — por isso o espelho em disco existe.
 */
export async function requestPersistence(): Promise<StorageStatus> {
  const storage = navigator.storage;
  if (!storage?.estimate) return { persistent: false, supported: false };

  let persistent = false;
  try {
    persistent = (await storage.persisted?.()) ?? false;
    if (!persistent && storage.persist) {
      persistent = await storage.persist();
    }
  } catch {
    persistent = false;
  }

  let usageBytes: number | undefined;
  let quotaBytes: number | undefined;
  try {
    const estimate = await storage.estimate();
    usageBytes = estimate.usage;
    quotaBytes = estimate.quota;
  } catch {
    // sem estimativa: seguimos so com o booleano
  }

  return { persistent, supported: true, usageBytes, quotaBytes };
}

export interface LocalSave {
  fileName: string;
  size: number;
  modified?: number;
}

/** A pasta `saves/` so existe em dev/preview; em producao devolve null. */
export async function listLocalSaves(): Promise<LocalSave[] | null> {
  try {
    const res = await fetch("/local-saves.json");
    if (!res.ok) return null;
    const list: unknown = await res.json();
    return Array.isArray(list) ? (list as LocalSave[]) : null;
  } catch {
    return null;
  }
}

/** Grava um save na pasta `saves/` do projeto. */
export async function writeLocalSave(
  fileName: string,
  data: Uint8Array
): Promise<void> {
  // Copia para um ArrayBuffer proprio: o buffer do core pode ser um
  // SharedArrayBuffer, que o fetch nao aceita como corpo.
  const copy = new Uint8Array(data.length);
  copy.set(data);

  const res = await fetch(`/local-saves/${encodeURIComponent(fileName)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: copy,
  });
  if (!res.ok) {
    throw new Error(`servidor respondeu ${res.status}: ${await res.text()}`);
  }
}

/**
 * Le um save da pasta `saves/`. Devolve ArrayBuffer e nao Uint8Array porque
 * um Uint8Array pode estar sobre SharedArrayBuffer, que nao serve de BlobPart.
 */
export async function readLocalSave(fileName: string): Promise<ArrayBuffer> {
  const res = await fetch(`/local-saves/${encodeURIComponent(fileName)}`);
  if (!res.ok) throw new Error(`servidor respondeu ${res.status}`);
  return res.arrayBuffer();
}

/** Nome do arquivo de save para uma ROM ("emerald.gba" -> "emerald.sav"). */
export function saveNameFor(romFileName: string): string {
  const base = romFileName.replace(/^.*[/\\]/, "");
  return base.replace(/\.(gb|gbc|gba)$/i, "") + ".sav";
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "—";
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${bytes} B`;
}
