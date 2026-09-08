/** Prioridade de idioma para textos que vem da PokeAPI. */
const LANGS = ["pt-br", "pt", "en"] as const;

interface Localized {
  language: { name: string };
}

/** Normaliza os separadores estranhos que a PokeAPI usa nos flavor texts. */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/[\f\n\r\v­]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escolhe a entrada em pt-BR, senao pt, senao en, senao a primeira disponivel,
 * e devolve o campo pedido ja limpo. String vazia quando nao ha nada.
 */
export function pickLocalized<T extends Localized>(
  entries: T[] | undefined | null,
  field: (entry: T) => string
): string {
  if (!entries || entries.length === 0) return "";
  for (const lang of LANGS) {
    const found = entries.find((e) => e.language.name === lang);
    if (found) return cleanFlavorText(field(found));
  }
  return cleanFlavorText(field(entries[0]));
}
