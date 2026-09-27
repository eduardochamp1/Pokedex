import { getLang, type Lang } from "../i18n/lang";

/**
 * Prioridade de idioma para textos que vem da PokeAPI. Em ingles, so ingles:
 * cair para o portugues no modo EN misturaria as duas linguas na mesma tela.
 */
const LANGS: Record<Lang, readonly string[]> = {
  pt: ["pt-br", "pt", "en"],
  en: ["en"],
};

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
 * Escolhe a entrada no idioma do site (pt-BR, senao pt, senao en; ou so en),
 * senao a primeira disponivel, e devolve o campo pedido ja limpo. String vazia
 * quando nao ha nada. `lang` explicito serve aos testes.
 */
export function pickLocalized<T extends Localized>(
  entries: T[] | undefined | null,
  field: (entry: T) => string,
  lang: Lang = getLang()
): string {
  if (!entries || entries.length === 0) return "";
  for (const codigo of LANGS[lang]) {
    const found = entries.find((e) => e.language.name === codigo);
    if (found) return cleanFlavorText(field(found));
  }
  return cleanFlavorText(field(entries[0]));
}
