/**
 * Estado real dos slots de save state.
 *
 * O core grava os estados em `/data/states/` com o nome `<rom sem extensao>.ssN`
 * — conferido no proprio `mgba.js`, que roteia arquivos `.ssN` para esse
 * diretorio, e no `loadGame`, que monta `saveName`/`autoSaveStateName` tirando
 * a extensao da ROM.
 *
 * Sem ler esse diretorio a UI so descobre que um slot esta vazio DEPOIS de
 * clicar em "carregar" e o core devolver false. Aqui a tela passa a dizer antes.
 */
import { SAVE_STATE_SLOTS, type SaveStateSlot, type mGBAEmulator } from "./types";

/** Uma entrada crua do diretorio de estados. */
export interface StateEntry {
  name: string;
  size?: number;
  /** Epoch ms da ultima modificacao, quando o FS informa. */
  modified?: number;
}

export interface SlotInfo {
  slot: SaveStateSlot;
  exists: boolean;
  size?: number;
  modified?: number;
}

/** Base de um nome de ROM: sem diretorio e sem extensao. */
export function romBaseName(romFileName: string): string {
  return romFileName
    .replace(/^.*[/\\]/, "")
    .replace(/\.(gb|gbc|gba)$/i, "");
}

/** Nome do arquivo de estado ("Emerald.gba", 1 -> "Emerald.ss1"). */
export function stateFileName(romFileName: string, slot: number): string {
  return `${romBaseName(romFileName)}.ss${slot}`;
}

/**
 * Inverso de stateFileName. Devolve null para qualquer coisa que nao seja um
 * estado numerado — inclusive o `_auto.ss`, que nao tem numero e nao ocupa slot.
 */
export function parseStateFileName(
  fileName: string
): { base: string; slot: number } | null {
  const m = fileName.match(/^(.*)\.ss(\d+)$/);
  if (!m) return null;
  return { base: m[1], slot: Number(m[2]) };
}

/** Nome do estado automatico que o core mantem ("Emerald.gba" -> "Emerald_auto.ss"). */
export function autoStateFileName(romFileName: string): string {
  return `${romBaseName(romFileName)}_auto.ss`;
}

/**
 * Cruza o diretorio de estados com a ROM atual e devolve os seis slots, na
 * ordem, dizendo quais estao ocupados. Sem ROM carregada todos vem vazios —
 * os estados sao por ROM, entao os do jogo anterior nao valem para este.
 */
export function slotsForRom(
  entries: StateEntry[],
  romFileName: string | undefined
): SlotInfo[] {
  const base = romFileName ? romBaseName(romFileName) : undefined;
  const found = new Map<number, StateEntry>();
  if (base !== undefined) {
    for (const entry of entries) {
      const parsed = parseStateFileName(entry.name);
      if (parsed && parsed.base === base) found.set(parsed.slot, entry);
    }
  }
  return SAVE_STATE_SLOTS.map((slot) => {
    const hit = found.get(slot);
    return hit
      ? { slot, exists: true, size: hit.size, modified: hit.modified }
      : { slot, exists: false };
  });
}

/** "agora", "há 3 min", "há 2 h", "12/03 14:07" — para a etiqueta do slot. */
export function describeAge(modified: number | undefined, now: number): string {
  if (modified === undefined) return "gravado";
  const diff = now - modified;
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)} h`;
  const d = new Date(modified);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

/**
 * Le o diretorio de estados do FS virtual do core.
 *
 * `FS` e o filesystem do Emscripten, exposto pelo modulo. Envolvido em
 * try/catch porque o diretorio pode nao existir antes do primeiro estado.
 */
export function readStateEntries(core: mGBAEmulator): StateEntry[] {
  const dir = core.filePaths().saveStatePath;
  let names: string[];
  try {
    names = core.FS.readdir(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name !== "." && name !== "..")
    .map((name) => {
      try {
        const stat = core.FS.stat(`${dir}/${name}`) as {
          size?: number;
          mtime?: Date | number;
        };
        const mtime = stat.mtime;
        return {
          name,
          size: stat.size,
          modified:
            mtime instanceof Date
              ? mtime.getTime()
              : typeof mtime === "number"
                ? mtime
                : undefined,
        };
      } catch {
        return { name };
      }
    });
}

/** Apaga o arquivo de um slot. Devolve false se nao havia o que apagar. */
export function deleteStateFile(
  core: mGBAEmulator,
  romFileName: string,
  slot: SaveStateSlot
): boolean {
  const path = `${core.filePaths().saveStatePath}/${stateFileName(romFileName, slot)}`;
  try {
    core.FS.unlink(path);
    return true;
  } catch {
    return false;
  }
}
