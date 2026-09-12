/**
 * Captura de tela e rebobinar.
 *
 * O core ja trazia as duas coisas e nenhuma tinha caminho na interface:
 * `screenshot()` escreve um PNG no FS virtual, e `toggleRewind()` liga o
 * rebobinar ativo em cima do buffer que o core mantem enquanto joga.
 */
import { romBaseName } from "./saveStates";

/**
 * Nome do PNG de uma captura.
 *
 * Leva a data para as capturas nao se sobrescreverem — o FS e plano e o mesmo
 * nome duas vezes perderia a primeira. Formato ordenavel (ano primeiro), para
 * a pasta ficar em ordem cronologica sozinha.
 */
export function screenshotFileName(romFileName: string, when: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp =
    `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}` +
    `-${pad(when.getHours())}${pad(when.getMinutes())}${pad(when.getSeconds())}`;
  return `${romBaseName(romFileName)}-${stamp}.png`;
}

/**
 * Ajustes do buffer de rebobinar.
 *
 * `rewindBufferCapacity` e uma contagem de estados guardados na memoria, e
 * `rewindBufferInterval` de quantos em quantos frames um estado entra. Com 600
 * e 1, cabem 600 frames — cerca de 10 s a 60 fps, que e o alcance util para
 * desfazer um erro sem que o custo de memoria pese.
 */
export const REWIND_SETTINGS = {
  rewindEnable: true,
  rewindBufferCapacity: 600,
  rewindBufferInterval: 1,
} as const;

/** Quantos segundos o buffer cobre, para a interface poder dizer. */
export function rewindSeconds(
  capacity: number = REWIND_SETTINGS.rewindBufferCapacity,
  interval: number = REWIND_SETTINGS.rewindBufferInterval,
  fps = 60
): number {
  if (fps <= 0 || interval <= 0) return 0;
  return Math.round((capacity * interval) / fps);
}
