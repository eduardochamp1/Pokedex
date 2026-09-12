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

/** "integer" = maior fator inteiro que cabe; "fit" = preenche, aceitando fracao. */
export type ScaleMode = "integer" | "fit" | 1 | 2 | 3 | 4;

export const SCALE_MODES: { id: ScaleMode; label: string; title: string }[] = [
  {
    id: "integer",
    label: "Nítido",
    title: "Maior escala inteira que cabe — cada pixel do jogo vira N pixels exatos",
  },
  {
    id: "fit",
    label: "Preencher",
    title: "Usa toda a altura disponível, mesmo com escala fracionária",
  },
  { id: 1, label: "1×", title: "Resolução nativa" },
  { id: 2, label: "2×", title: "Dobro da resolução nativa" },
  { id: 3, label: "3×", title: "Três vezes a resolução nativa" },
  { id: 4, label: "4×", title: "Quatro vezes a resolução nativa" },
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
