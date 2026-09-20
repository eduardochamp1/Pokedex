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

/** Sufixo de forma regional: é o nome de uma região, não do bicho. */
const REGIONAIS: Record<string, string> = {
  alola: "de Alola",
  galar: "de Galar",
  hisui: "de Hisui",
  paldea: "de Paldea",
};

const maiuscula = (parte: string) =>
  parte.charAt(0).toUpperCase() + parte.slice(1);

export function pokemonLabel(slug: string): string {
  const limpo = slug.toLowerCase().trim();
  if (!limpo) return "";
  if (EXCECOES[limpo]) return EXCECOES[limpo];

  const partes = limpo.split("-");
  const sufixo = REGIONAIS[partes[partes.length - 1]];
  if (partes.length > 1 && sufixo) {
    return `${partes.slice(0, -1).map(maiuscula).join(" ")} ${sufixo}`;
  }
  return partes.map(maiuscula).join(" ");
}
