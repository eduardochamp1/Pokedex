/**
 * A aba do aparelho a que um endereço pertence.
 *
 * A ficha (`/pokemon/pikachu`) é a mesma tela da Pokédex, só com a seleção
 * feita: precisa cair na mesma aba que `/`, senão ir da lista para a ficha
 * contaria como trocar de aba e devolveria o celular para a lista.
 */
export function sectionOf(pathname: string): string {
  const primeiro = pathname.split("/")[1] ?? "";
  return primeiro === "pokemon" ? "" : primeiro;
}
