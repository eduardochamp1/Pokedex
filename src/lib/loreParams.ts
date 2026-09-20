/**
 * A aba da Lore na URL.
 *
 * A Lore guardava a aba ativa só em `useState`, então nenhuma das treze abas
 * era endereçável: não dava para mandar um link para a Cronologia, nem para a
 * aba de Gerações, nem para voltar onde se estava depois de recarregar. Quem
 * precisasse apontar para lá — a aba `/jogar`, por exemplo — só conseguia
 * apontar para a Lore inteira.
 *
 * Mesmo padrão de `homeParams.ts`: um parser puro, validado contra a lista de
 * ids que a página conhece, com teste próprio. Valor inválido cai na primeira
 * aba em vez de deixar a tela vazia.
 */

/** Os ids das abas, na ordem em que a página as apresenta. */
export const LORE_TABS = [
  "timeline",
  "genealogy",
  "generations",
  "regions",
  "humans",
  "villains",
  "dimensions",
  "battles",
  "myths",
  "civilizations",
  "breeding",
  "items",
  "landmarks",
] as const;

export type LoreTab = (typeof LORE_TABS)[number];

export const DEFAULT_LORE_TAB: LoreTab = "timeline";

function isLoreTab(value: string | null): value is LoreTab {
  return value !== null && (LORE_TABS as readonly string[]).includes(value);
}

/** Lê a aba pedida na URL; qualquer coisa fora da lista vira a aba padrão. */
export function parseLoreTab(params: URLSearchParams): LoreTab {
  const pedida = params.get("aba");
  return isLoreTab(pedida) ? pedida : DEFAULT_LORE_TAB;
}

/**
 * Monta os parâmetros da URL para uma aba.
 *
 * A aba padrão não entra: URL limpa para o caso comum, como `homeParams` faz.
 */
export function serializeLoreTab(tab: LoreTab): URLSearchParams {
  const out = new URLSearchParams();
  if (tab !== DEFAULT_LORE_TAB) out.set("aba", tab);
  return out;
}
