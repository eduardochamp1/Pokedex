/**
 * Escala da tela do emulador.
 *
 * O canvas tem a resolucao nativa do console (240x160 no GBA, 160x144 no
 * GB/GBC) e era esticado com `object-fit: contain` para preencher a caixa.
 * Isso da uma escala fracionaria: com `image-rendering: pixelated` o navegador
 * arredonda cada pixel de origem para o destino, e uns saem com 3 px de lado e
 * outros com 4 — a imagem fica com o espacamento irregular que aparece como
 * tremido nas bordas e nas fontes do jogo.
 *
 * Escala inteira resolve: todo pixel do console vira exatamente N pixels na
 * tela. Sobra borda preta, e e o preco certo a pagar.
 */

/**
 * "auto" = inteiro quando compensa, senao preenche; "integer" = sempre inteiro;
 * "fit" = preenche, aceitando fracao.
 */
export type ScaleMode = "auto" | "integer" | "fit" | 1 | 2 | 3 | 4;

/**
 * Abaixo deste fator a escala inteira nao compensa.
 *
 * O ganho da escala inteira e nao ter pixel de tamanho irregular. Mas quando o
 * espaco so comporta 1x, "inteiro" e literalmente a resolucao nativa — 240x160
 * perdidos num container de 392x552 num celular, com 38% da area desperdicada e
 * nenhuma nitidez ganha, porque 1x nao escala nada. A partir de 2x o troco
 * passa a valer.
 */
const INTEGER_WORTH_IT = 2;

export const SCALE_MODES: {
  id: ScaleMode;
  label: string;
  labelEn: string;
  title: string;
  titleEn: string;
}[] = [
  {
    id: "auto",
    label: "Auto",
    labelEn: "Auto",
    title:
      "Escala inteira quando cabe 2× ou mais; abaixo disso preenche, para não desperdiçar a tela",
    titleEn: "Integer scale when 2× or more fits; below that it fills, so the screen isn't wasted",
  },
  {
    id: "integer",
    label: "Nítido",
    labelEn: "Sharp",
    title: "Maior escala inteira que cabe — cada pixel do jogo vira N pixels exatos",
    titleEn: "Largest integer scale that fits — each game pixel becomes exactly N pixels",
  },
  {
    id: "fit",
    label: "Preencher",
    labelEn: "Fill",
    title: "Usa toda a altura disponível, mesmo com escala fracionária",
    titleEn: "Uses all the available height, even with a fractional scale",
  },
  { id: 1, label: "1×", labelEn: "1×", title: "Resolução nativa", titleEn: "Native resolution" },
  { id: 2, label: "2×", labelEn: "2×", title: "Dobro da resolução nativa", titleEn: "Twice the native resolution" },
  { id: 3, label: "3×", labelEn: "3×", title: "Três vezes a resolução nativa", titleEn: "Three times the native resolution" },
  { id: 4, label: "4×", labelEn: "4×", title: "Quatro vezes a resolução nativa", titleEn: "Four times the native resolution" },
];

export interface Size {
  width: number;
  height: number;
}

/**
 * Fator de escala para um modo.
 *
 * Os fatores fixos sao tetos, nao pisos: escolher 4x numa janela que so comporta
 * 2x devolve 2x, em vez de cortar a tela. Nunca desce abaixo de 1.
 */
export function scaleFactor(
  mode: ScaleMode,
  container: Size,
  native: Size
): number {
  if (native.width <= 0 || native.height <= 0) return 1;
  const fit = Math.min(
    container.width / native.width,
    container.height / native.height
  );
  if (!Number.isFinite(fit) || fit <= 0) return 1;
  if (mode === "fit") return fit;
  const maxInteger = Math.max(1, Math.floor(fit));
  if (mode === "integer") return maxInteger;
  if (mode === "auto") {
    return maxInteger >= INTEGER_WORTH_IT ? maxInteger : fit;
  }
  return Math.min(mode, maxInteger);
}

/** Tamanho final do canvas em pixels de CSS, ja arredondado. */
export function canvasSizeFor(
  mode: ScaleMode,
  container: Size,
  native: Size
): Size {
  const factor = scaleFactor(mode, container, native);
  return {
    width: Math.round(native.width * factor),
    height: Math.round(native.height * factor),
  };
}

/** Le a resolucao nativa do canvas, com o GBA como fallback. */
export function nativeSizeOf(canvas: HTMLCanvasElement): Size {
  return {
    width: canvas.width > 0 ? canvas.width : 240,
    height: canvas.height > 0 ? canvas.height : 160,
  };
}

/** Rotulo do que esta valendo agora ("3× · 720×480"). */
export function describeScale(size: Size, native: Size): string {
  const factor = native.width > 0 ? size.width / native.width : 1;
  const shown =
    Number.isInteger(factor) ? `${factor}×` : `${factor.toFixed(2)}×`;
  return `${shown} · ${size.width}×${size.height}`;
}
