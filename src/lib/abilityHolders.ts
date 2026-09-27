import type { AbilityDetail } from "../types/pokemon";
import { extractIdFromUrl } from "./filters";

export interface Holder {
  name: string;
  id: number;
}

/**
 * Quem tem a habilidade, separado em comum e oculta, pela ordem da dex. O id
 * sai da url, que é o que o sprite local usa — sem request por pokémon.
 */
export function abilityHolders(detail: Pick<AbilityDetail, "pokemon">): {
  regular: Holder[];
  hidden: Holder[];
} {
  const regular: Holder[] = [];
  const hidden: Holder[] = [];
  for (const e of detail.pokemon ?? []) {
    const id = extractIdFromUrl(e.pokemon.url);
    if (id === undefined) continue;
    (e.is_hidden ? hidden : regular).push({ name: e.pokemon.name, id });
  }
  const porId = (a: Holder, b: Holder) => a.id - b.id;
  return { regular: regular.sort(porId), hidden: hidden.sort(porId) };
}
