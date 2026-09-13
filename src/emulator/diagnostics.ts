/**
 * Ajustes de audio/video e o log do core.
 *
 * O core aceita `audioSync`, `videoSync` e `showFpsCounter` desde sempre e
 * nenhum tinha caminho na tela — quem ouvisse estalos no audio nao tinha o que
 * fazer. E `setLogger` entrega o log interno do core, que ate agora ia para
 * lugar nenhum: quando um jogo se comportava mal, nao havia o que olhar.
 */
import type { LogEntry, LogLevel } from "@thenick775/mgba-wasm";

export interface AvSettings {
  /** Sincroniza o video com a velocidade do audio. Corta estalos. */
  audioSync: boolean;
  /** Sincroniza o video com o refresh do monitor (vsync). */
  videoSync: boolean;
  /** Contador de quadros por segundo desenhado pelo proprio core. */
  showFpsCounter: boolean;
}

/** Os defaults do core, segundo a tipagem publicada. */
export const DEFAULT_AV: AvSettings = {
  audioSync: false,
  videoSync: false,
  showFpsCounter: false,
};

export function isAvSettings(value: unknown): value is AvSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.audioSync === "boolean" &&
    typeof v.videoSync === "boolean" &&
    typeof v.showFpsCounter === "boolean"
  );
}

export const AV_TOGGLES: {
  id: keyof AvSettings;
  label: string;
  hint: string;
}[] = [
  {
    id: "audioSync",
    label: "Sincronizar áudio",
    hint: "Amarra o vídeo à velocidade do áudio. Ligue se ouvir estalos ou cortes.",
  },
  {
    id: "videoSync",
    label: "Sincronizar vídeo",
    hint: "Amarra os quadros ao refresh do monitor (vsync). Ligue se a imagem rasgar.",
  },
  {
    id: "showFpsCounter",
    label: "Mostrar FPS",
    hint: "Contador de quadros por segundo, desenhado pelo próprio core.",
  },
];

/** Quantas linhas de log guardamos. O suficiente para ver o que precedeu. */
export const LOG_LIMIT = 80;

export interface LogLine {
  level: LogLevel;
  category: string;
  message: string;
  /** Repeticoes seguidas da mesma linha, colapsadas. */
  count: number;
}

/**
 * Acrescenta uma linha ao log, colapsando repeticao imediata.
 *
 * O core repete a mesma mensagem centenas de vezes em alguns jogos — sem
 * colapsar, a janela util some antes de qualquer coisa interessante aparecer.
 * Pura de proposito: o hook so guarda o resultado.
 */
export function appendLog(
  lines: LogLine[],
  entry: LogEntry,
  limit = LOG_LIMIT
): LogLine[] {
  const last = lines[lines.length - 1];
  if (
    last &&
    last.level === entry.level &&
    last.category === entry.category &&
    last.message === entry.message
  ) {
    const bumped = [...lines];
    bumped[bumped.length - 1] = { ...last, count: last.count + 1 };
    return bumped;
  }
  const next = [...lines, { ...entry, count: 1 }];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

/** Niveis que merecem destaque na tela. */
export function isProblem(level: LogLevel): boolean {
  return level === "FATAL" || level === "ERROR" || level === "GAME ERROR";
}

/** "[WARN] GBA BIOS: mensagem" — uma linha pronta para exibir ou copiar. */
export function formatLogLine(line: LogLine): string {
  const repeat = line.count > 1 ? ` (${line.count}×)` : "";
  return `[${line.level}] ${line.category}: ${line.message}${repeat}`;
}
