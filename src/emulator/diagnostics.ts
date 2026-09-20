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
  /**
   * Avanca em passos discretos de `baseFpsTarget` em vez de tempo variavel.
   *
   * E o ajuste que decide QUEM manda no ritmo da emulacao, e o core o traz
   * ligado. Ligado, o core anda em incrementos fixos de 1/60 s e ignora
   * quanto tempo real passou — entao a barra de velocidade nao tem por onde
   * agir sobre o jogo, e so o audio acelera. Desligado, o ritmo vem do audio
   * (com `audioSync`), que e o caminho por onde o multiplicador funciona.
   */
  timestepSync: boolean;
  /** Contador de quadros por segundo desenhado pelo proprio core. */
  showFpsCounter: boolean;
}

/**
 * Os defaults do core, segundo a tipagem publicada.
 *
 * Ja tentei mexer aqui para resolver a barra de velocidade que acelerava so a
 * musica, apostando que `timestepSync` era o culpado. **Nao era**, e a medicao
 * mostrou onde estava: `setFastForwardMultiplier` mudava o valor interno e o
 * laco principal continuava preso em `requestAnimationFrame`, um tick por
 * quadro. A correcao ficou em `aplicarVelocidade`, no useEmulator, e estes
 * valores voltaram para o que o core traz.
 *
 * O `timestepSync` continua alcancavel pela tela, que e um ganho que sobrou da
 * tentativa: ele decide se o core anda em passos fixos de 1/60 s ou por tempo
 * decorrido, e antes nao havia como experimentar.
 */
export const DEFAULT_AV: AvSettings = {
  audioSync: false,
  videoSync: false,
  timestepSync: true,
  showFpsCounter: false,
};

export function isAvSettings(value: unknown): value is AvSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.audioSync === "boolean" &&
    typeof v.videoSync === "boolean" &&
    // Preferencia gravada por uma versao anterior nao tem este campo, entao
    // cai no default — que e exatamente o que se quer aqui: o valor antigo era
    // o que produzia a aceleracao esquisita.
    typeof v.timestepSync === "boolean" &&
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
    id: "timestepSync",
    label: "Passo fixo",
    hint:
      "Avança em passos de 1/60 s em vez de seguir o áudio. Ligado, a barra de " +
      "velocidade acelera só a música, e o jogo dá arrancadas quando a aba engasga.",
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
