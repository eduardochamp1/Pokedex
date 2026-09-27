import { getLang, type Lang } from "../i18n/lang";
/**
 * Rótulo legível para um pokémon guardado pelo slug da API.
 *
 * Os verbetes curados guardam o slug ("tapu-koko", "great-tusk",
 * "ponyta-galar") porque é ele que resolve o sprite e a rota da ficha. Na
 * tela, o chip escrevia o próprio slug com `text-transform: capitalize`, o
 * que produzia "Tapu-Koko", "Great-Tusk" e "Ponyta-Galar" — nenhum deles é
 * o nome da criatura.
 *
 * A regra geral é trocar hífen por espaço, mas ela erra em dois grupos: os
 * nomes cuja pontuação é própria (Ho-Oh, Type: Null, Farfetch'd) e as formas
 * regionais, em que o sufixo é o nome de uma região e não parte do nome.
 */

/** Nomes cuja pontuação não sai de regra nenhuma. */
const EXCECOES: Record<string, string> = {
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  "type-null": "Type: Null",
  "mr-mime": "Mr. Mime",
  "mr-rime": "Mr. Rime",
  "mime-jr": "Mime Jr.",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "nidoran-f": "Nidoran ♀",
  "nidoran-m": "Nidoran ♂",
};

/**
 * Forma regional: é o nome de uma região, não do bicho. Em português vem
 * depois ("Vulpix de Alola"); em inglês, como adjetivo antes ("Alolan Vulpix").
 */
const REGIONAIS: Record<string, [string, string]> = {
  alola: ["de Alola", "Alolan"],
  galar: ["de Galar", "Galarian"],
  hisui: ["de Hisui", "Hisuian"],
  paldea: ["de Paldea", "Paldean"],
};

const maiuscula = (parte: string) =>
  parte.charAt(0).toUpperCase() + parte.slice(1);

export function pokemonLabel(slug: string, lang: Lang = getLang()): string {
  const limpo = slug.toLowerCase().trim();
  if (!limpo) return "";
  if (EXCECOES[limpo]) return EXCECOES[limpo];

  const partes = limpo.split("-");
  const regional = REGIONAIS[partes[partes.length - 1]];
  if (partes.length > 1 && regional) {
    const nome = partes.slice(0, -1).map(maiuscula).join(" ");
    return lang === "en" ? `${regional[1]} ${nome}` : `${nome} ${regional[0]}`;
  }
  return partes.map(maiuscula).join(" ");
}
