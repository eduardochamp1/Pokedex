/**
 * Abrir a busca de qualquer lugar sem importar o componente dela: o botão da
 * navbar dispara o evento, e o `CommandLauncher` escuta.
 */
export const OPEN_SEARCH_EVENT = "pokedex:abrir-busca";

export function openSearch(): void {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}
