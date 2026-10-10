/**
 * Ajustes de audio/video e o log do core.
 *
 * O core aceita `audioSync`, `videoSync` e `showFpsCounter` desde sempre e
 * nenhum tinha caminho na tela — quem ouvisse estalos no audio nao tinha o que
 * fazer. E `setLogger` entrega o log interno do core, que ate agora ia para
 * lugar nenhum: quando um jogo se comportava mal, nao havia o que olhar.
 */
import type { LogEntry, LogLevel } from "@thenick775/mgba-wasm";
import { MGBA_CORE_SETTINGS } from "./mgbaDefaults";

/**
 * O que esta tela deixa a pessoa mexer.
 *
 * ### `timestepSync` saiu daqui, e a razao e medida
 *
 * O passo fixo era o quarto interruptor do painel, com a dica dizendo "Deixe
 * ligado" — o que ja denunciava que ele nao era preferencia nenhuma. Medindo o
 * que o desligado faz, em Emerald: **o jogo passa a rodar a 6,8x a velocidade
 * normal.** Nao e "mais rapido", e errado: o audio, as animacoes e a
 * contagem interna do jogo vao junto.
 *
 * Um interruptor cujo unico valor correto e o que ja esta ligado nao e escolha,
 * e uma armadilha com legenda. O valor certo agora vem de `MGBA_CORE_SETTINGS`
 * e ninguem o desliga.
 *
 * Os tres que ficaram custam **zero** de velocidade — medido a 8x, tres
 * amostras cada: padrao 7,73x, audioSync 7,73x, videoSync 7,90x,
 * showFpsCounter 7,84x, tudo dentro do ruido. Eles nao estao aqui por
 * desempenho: `audioSync` e o remedio de quem ouve estalos, `videoSync` o de
 * quem ve a imagem rasgar, e o contador de FPS e diagnostico. Sao respostas a
 * sintomas que dependem da maquina de quem joga, e nenhum deles piora a
 * emulacao.
 */
export interface AvSettings {
  /** Sincroniza o video com a velocidade do audio. Corta estalos. */
  audioSync: boolean;
  /** Sincroniza o video com o refresh do monitor (vsync). */
  videoSync: boolean;
  /** Contador de quadros por segundo desenhado pelo proprio core. */
  showFpsCounter: boolean;
}

/**
 * O ponto de partida da tela de A/V.
 *
 * Os valores saem de `MGBA_CORE_SETTINGS`, que segue o **gbajs3** — a
 * implementacao de referencia deste mesmo core. Importar dali em vez de repetir
 * o literal evita que os dois lugares divirjam: a inicializacao aplica aquele
 * objeto e esta tela roda depois, entao valores diferentes fariam a tela
 * desfazer a configuracao.
 *
 * `audioSync` vem **desligado**, como no gbajs3. Isso nao atrapalha o turbo:
 * acelerar liga o `audioWait` dentro do core por conta propria, e e esse par
 * (`fpsTarget` alto + `audioWait`) que puxa os quadros mais rapido. Por isso a
 * preferencia daqui so e reafirmada ao **sair** do turbo — ver
 * `aplicarVelocidade` em `useEmulator.ts`. O toggle segue na tela porque ligar
 * ajuda quem ouve estalos em velocidade normal.
 */
export const DEFAULT_AV: AvSettings = {
  audioSync: MGBA_CORE_SETTINGS.audioSync ?? false,
  videoSync: MGBA_CORE_SETTINGS.videoSync ?? false,
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
  /** Inglês; sem ele, a tela em inglês cai no português. */
  labelEn?: string;
  hintEn?: string;
}[] = [
  {
    id: "audioSync",
    label: "Sincronizar áudio",
    hint: "Amarra o vídeo à velocidade do áudio. Ligue se ouvir estalos ou cortes.",
    labelEn: "Sync audio",
    hintEn: "Ties the video to the audio speed. Turn it on if you hear pops or dropouts.",
  },
  {
    id: "videoSync",
    label: "Sincronizar vídeo",
    hint: "Amarra os quadros ao refresh do monitor (vsync). Ligue se a imagem rasgar.",
    labelEn: "Sync video",
    hintEn: "Ties the frames to the monitor refresh (vsync). Turn it on if the image tears.",
  },
  {
    id: "showFpsCounter",
    label: "Mostrar FPS",
    hint: "Contador de quadros por segundo, desenhado pelo próprio core.",
    labelEn: "Show FPS",
    hintEn: "Frames-per-second counter, drawn by the core itself.",
  },
];

/** Quantas linhas de log guardamos. O suficiente para ver o que precedeu. */
export const LOG_LIMIT = 80;

/**
 * Este nivel chega ao painel?
 *
 * **DEBUG e INFO nao chegam, e isso e desempenho, nao gosto.** O core emite
 * cerca de 3,2 linhas por quadro emulado — em Emerald, o par de VBlank que todo
 * jogo de GBA faz:
 *
 *     DEBUG GBA BIOS: SWI: 0B r0: 030022F8 …
 *     INFO  GBA DMA: Starting DMA 3 0x02037B14 -> 0x05000000 (8000:0200)
 *
 * Sao ~190 linhas por segundo em velocidade normal e ~950 quando o turbo pede
 * 5x: o custo cresce junto com o que se quer acelerar. Medindo por nivel
 * durante o jogo normal, **100% do trafego era DEBUG e INFO — nenhum WARN,
 * nenhum ERROR.** Com cada linha virando estado do React, a `/jogar` ficava em
 * 1,0–1,4x no turbo contra 5,01x da pagina isolada do `dev/`; filtrando aqui,
 * ela encosta nos mesmos 5,00x.
 *
 * STUB fica: e raro e e exatamente "algo fora do comum", que e o que o painel
 * promete mostrar. Se um dia um jogo inundar de WARN, quem segura e a descarga
 * por intervalo do `useDiagnostics` — este filtro e a primeira camada, nao a
 * unica.
 */
export function isShown(level: LogLevel): boolean {
  return level !== "DEBUG" && level !== "INFO";
}

export interface LogLine {
  level: LogLevel;
  category: string;
  message: string;
  /** Repeticoes seguidas da mesma linha, colapsadas. */
  count: number;
  /**
   * As linhas colapsadas aqui tinham mensagens diferentes entre si?
   *
   * Muda o que a tela escreve: `(74×)` e "esta mensagem, 74 vezes";
   * `(74× parecidas)` e "74 linhas da mesma familia, e a mostrada e a
   * primeira". Sem esta distincao a contagem mentiria.
   */
  varied: boolean;
  /**
   * Identidade da linha na lista, para a chave do React.
   *
   * A chave era o indice (`${i}-${message}`), e o indice mente numa janela que
   * desliza: ao passar do teto, `slice` empurra tudo uma casa e **todos** os 80
   * `<li>` mudam de chave de uma vez, entao o React destruia e recriava a lista
   * inteira a cada linha. Medido no painel: 15.423 mutacoes de DOM por segundo.
   *
   * Derivado da linha anterior, e nao de um contador de modulo: assim
   * `appendLog` continua pura e o teste consegue prever o valor.
   */
  seq: number;
}

/**
 * A "forma" de uma mensagem: ela sem os numeros que variam de uma para a outra.
 *
 * Existe porque o colapso por texto exato nao resolvia o caso real. O boot da
 * Emerald escreve 74 linhas assim:
 *
 *     Bad memory Store16: 0x00000022
 *     Bad memory Store16: 0x00000024
 *     Bad memory Store16: 0x00000026
 *
 * Sao a mesma ocorrencia — o jogo escrevendo numa faixa de memoria que nao
 * existe — e nenhuma delas era igual a anterior, entao as 74 entravam inteiras
 * e enchiam sozinhas a janela de 80. Quem abrisse o painel via 74 linhas
 * vermelhas de um boot **saudavel**, e qualquer coisa que acontecesse durante o
 * jogo teria que furar essa fila.
 *
 * A normalizacao e proposital nos dois sentidos:
 *
 * - `0x…` e numeros soltos viram `#`: sao o endereco e o valor, o que varia.
 * - numero **grudado** em palavra fica: `Store16` e `Store32` continuam formas
 *   diferentes, e `SIOMULTI0` nao vira o mesmo que `SIOMULTI1`. O `\b` nao casa
 *   entre letra e digito, e e essa a razao de a regra ser escrita assim.
 */
export function logShape(message: string): string {
  return message.replace(/0x[0-9A-Fa-f]+|\b\d+\b/g, "#");
}

/**
 * Acrescenta uma linha ao log, colapsando repeticao imediata.
 *
 * O core repete a mesma coisa centenas de vezes em alguns jogos — sem colapsar,
 * a janela util some antes de qualquer coisa interessante aparecer. O criterio
 * e nivel, categoria e **forma** da mensagem (ver `logShape`), e so entre
 * linhas vizinhas: duas familias diferentes nunca se misturam, e a linha
 * guardada e a **primeira** da sequencia, que e onde a coisa comecou.
 *
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
    logShape(last.message) === logShape(entry.message)
  ) {
    // A linha colapsada mantem o `seq`: para o React e o mesmo `<li>`, so com
    // a contagem nova.
    const bumped = [...lines];
    bumped[bumped.length - 1] = {
      ...last,
      count: last.count + 1,
      varied: last.varied || last.message !== entry.message,
    };
    return bumped;
  }
  const next = [
    ...lines,
    { ...entry, count: 1, varied: false, seq: (last?.seq ?? 0) + 1 },
  ];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

/** Niveis que merecem destaque na tela. */
export function isProblem(level: LogLevel): boolean {
  return level === "FATAL" || level === "ERROR" || level === "GAME ERROR";
}

/**
 * "[WARN] GBA BIOS: mensagem" — uma linha pronta para exibir ou copiar.
 *
 * O "parecidas" nao e enfeite: quando o colapso juntou mensagens diferentes,
 * escrever so `(74×)` diria que aquela mensagem exata aconteceu 74 vezes, e nao
 * aconteceu — a mostrada e a primeira de 74 da mesma familia.
 */
export function formatLogLine(line: LogLine): string {
  const repeat =
    line.count > 1 ? ` (${line.count}×${line.varied ? " parecidas" : ""})` : "";
  return `[${line.level}] ${line.category}: ${line.message}${repeat}`;
}
