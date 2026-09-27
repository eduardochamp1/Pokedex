/**
 * As cadeias de evolução como a página de árvores usa: filtro por método,
 * geração, nome e ramificação, e a árvore montada para desenhar. Puro.
 */
import type { EvoChain, EvoDetailLite } from "../data/evolutionChains";
import type { EvolutionDetail } from "../types/pokemon";
import { GEN_RANGES } from "./quiz";

/** O formato da API, a partir do compacto — é o que `evolutionConditionText` lê. */
export function expandDetail(d: EvoDetailLite, slugOf: (national: number) => string): EvolutionDetail {
  const ref = (name: string) => ({ name, url: "" });
  return {
    trigger: ref(d.t),
    min_level: d.lv ?? null,
    item: d.item ? ref(d.item) : null,
    held_item: d.held ? ref(d.held) : null,
    known_move: d.move ? ref(d.move) : null,
    known_move_type: d.moveType ? ref(d.moveType) : null,
    location: d.loc ? ref(d.loc) : null,
    min_happiness: d.hap ?? null,
    min_affection: d.aff ?? null,
    min_beauty: d.beauty ?? null,
    needs_overworld_rain: d.rain ?? false,
    time_of_day: d.time ?? "",
    turn_upside_down: d.upside ?? false,
    gender: d.gender ?? null,
    trade_species: d.tradeFor ? ref(slugOf(d.tradeFor)) : null,
  };
}

export type EvoMethod = "level" | "item" | "trade" | "friendship" | "held" | "move" | "location" | "time" | "other";

export const EVO_METHODS: EvoMethod[] = ["level", "item", "trade", "friendship", "held", "move", "location", "time", "other"];

export function methodsOf(d: EvoDetailLite): EvoMethod[] {
  if (d.t === "use-item") return ["item"];
  if (d.t === "trade") return ["trade"];
  const out: EvoMethod[] = [];
  if (d.hap !== undefined || d.aff !== undefined) out.push("friendship");
  if (d.held) out.push("held");
  if (d.move || d.moveType) out.push("move");
  if (d.loc) out.push("location");
  if (d.time) out.push("time");
  if (d.t === "level-up" && d.lv !== undefined && out.length === 0) out.push("level");
  return out.length ? out : ["other"];
}

export interface TreeFilter {
  method: EvoMethod | "all";
  gen: number | "all";
  query: string;
  branched: boolean;
}

const normalizar = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/-/g, " ").trim();

/** Só cadeias com alguma evolução — espécie solitária não é árvore. */
export function filterChains(chains: EvoChain[], f: TreeFilter, nameOf: (national: number) => string): EvoChain[] {
  const q = normalizar(f.query);
  const faixa = f.gen === "all" ? undefined : GEN_RANGES[f.gen - 1];
  return chains.filter((c) => {
    if (c.edges.length === 0) return false;
    if (f.method !== "all" && !c.edges.some((e) => e.d.some((d) => methodsOf(d).includes(f.method as EvoMethod)))) return false;
    if (faixa && !c.species.some((n) => n >= faixa[0] && n <= faixa[1])) return false;
    if (q && !c.species.some((n) => normalizar(nameOf(n)).includes(q))) return false;
    if (f.branched) {
      const saidas = new Map<number, number>();
      for (const e of c.edges) saidas.set(e.from, (saidas.get(e.from) ?? 0) + 1);
      if (![...saidas.values()].some((n) => n >= 2)) return false;
    }
    return true;
  });
}

export interface TreeNode {
  id: number;
  children: { node: TreeNode; details: EvoDetailLite[] }[];
}

export function buildTree(chain: EvoChain): TreeNode {
  const montar = (id: number): TreeNode => ({
    id,
    children: chain.edges.filter((e) => e.from === id).map((e) => ({ node: montar(e.to), details: e.d })),
  });
  return montar(chain.species[0]);
}
