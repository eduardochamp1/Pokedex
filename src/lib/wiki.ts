/**
 * Links de fonte para os verbetes curados.
 *
 * Por que so link, e nao imagem: o Bulbapedia bloqueia hotlink de imagem
 * (archives.bulbagarden.net responde 403), e a arte de personagens, regioes e
 * organizacoes e propriedade da Nintendo/Game Freak. Entao a ilustracao do
 * site vem da PokeAPI (pokemon e itens) ou do SVG proprio (LoreArt), e a wiki
 * entra como fonte citada — que tambem serve de atribuicao.
 *
 * Todos os titulos usados no projeto foram validados via API do MediaWiki:
 * nenhum verbete aponta para pagina inexistente ou redirect.
 */

const BULBAPEDIA = "https://bulbapedia.bulbagarden.net/wiki/";
const FANDOM_PTBR = "https://pokemon.fandom.com/pt-br/wiki/";

function encodeTitle(title: string): string {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

export function bulbapediaUrl(title: string): string {
  return BULBAPEDIA + encodeTitle(title);
}

export function fandomPtUrl(title: string): string {
  return FANDOM_PTBR + encodeTitle(title);
}

/** Qualquer verbete curado pode citar sua fonte na wiki. */
export interface WikiSourced {
  /** Titulo exato da pagina na Bulbapedia (validado). */
  wiki?: string;
}
