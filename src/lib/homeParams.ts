import { POKEMON_TYPES } from "../hooks/usePokemon";
import { RARITIES, type RarityId } from "../data/rarity";

export const SORTS = [
  { id: "id", label: "Número" },
  { id: "nome", label: "Nome" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export interface HomeParams {
  search: string;
  type: string | undefined;
  generation: number | undefined;
  rarity: RarityId | undefined;
  sort: SortId;
  page: number;
}

const DEFAULTS: HomeParams = {
  search: "",
  type: undefined,
  generation: undefined,
  rarity: undefined,
  sort: "id",
  page: 0,
};

/**
 * Le os criterios da URL, validando cada um. Valor invalido cai no padrao em
 * vez de propagar — a URL e entrada de usuario.
 */
export function parseHomeParams(params: URLSearchParams): HomeParams {
  const type = params.get("tipo") ?? undefined;
  const validType =
    type && (POKEMON_TYPES as readonly string[]).includes(type)
      ? type
      : undefined;

  const genRaw = Number(params.get("ger"));
  const generation =
    Number.isInteger(genRaw) && genRaw >= 1 && genRaw <= 9 ? genRaw : undefined;

  const rarity = params.get("rar") ?? undefined;
  const validRarity = RARITIES.some((r) => r.id === rarity)
    ? (rarity as RarityId)
    : undefined;

  const sortRaw = params.get("ord");
  const sort = SORTS.some((s) => s.id === sortRaw)
    ? (sortRaw as SortId)
    : DEFAULTS.sort;

  const pageRaw = Number(params.get("p"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw - 1 : 0;

  return {
    search: params.get("q") ?? "",
    type: validType,
    generation,
    rarity: validRarity,
    sort,
    page,
  };
}

/** Serializa, omitindo o que esta no padrao para a URL nao encher de lixo. */
export function toSearchParams(p: HomeParams): URLSearchParams {
  const out = new URLSearchParams();
  if (p.search) out.set("q", p.search);
  if (p.type) out.set("tipo", p.type);
  if (p.generation) out.set("ger", String(p.generation));
  if (p.rarity) out.set("rar", p.rarity);
  if (p.sort !== DEFAULTS.sort) out.set("ord", p.sort);
  if (p.page > 0) out.set("p", String(p.page + 1));
  return out;
}
