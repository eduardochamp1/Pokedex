/**
 * As 14 caixas do PC como uma lista que se busca, filtra e ordena. Puro: o
 * nome de cada espécie chega por função, como em `trainerText`.
 */
import type { Gen3BoxMon, Gen3PartyMember } from "../emulator/saveParse/gen3";
import { expectedGen3Stats, type StatSpread } from "./gen3Stats";
import { growthRateOf, levelFromExp } from "./gen3Level";

/**
 * Como a ficha guarda um pokémon de caixa. Entradas gravadas antes de o PC
 * ter ficha só têm espécie e apelido — o resto é opcional por isso.
 */
export type StoredBoxMon = Pick<Gen3BoxMon, "national" | "nickname"> &
  Partial<Omit<Gen3BoxMon, "national" | "nickname">>;

export interface StoredBox {
  name: string;
  pokemon: StoredBoxMon[];
}

export type PcSort = "box" | "dex" | "level";

export interface PcFilter {
  query: string;
  /** Índice da caixa, ou todas. */
  box: number | "all";
  shinyOnly: boolean;
  sort: PcSort;
}

export interface PcEntry {
  box: number;
  mon: StoredBoxMon;
  /** `null` quando a entrada é antiga e não tem experiência. */
  level: number | null;
}

export function boxMonLevel(mon: StoredBoxMon): number | null {
  const curva = growthRateOf(mon.national);
  if (!curva || mon.experience === undefined) return null;
  return levelFromExp(curva, mon.experience);
}

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export function listPc(
  boxes: StoredBox[],
  filter: PcFilter,
  nameOf: (national: number) => string
): PcEntry[] {
  const q = normalizar(filter.query);
  const numero = /^#?\d+$/.test(q) ? Number(q.replace("#", "")) : undefined;

  const out: PcEntry[] = [];
  boxes.forEach((caixa, box) => {
    if (filter.box !== "all" && filter.box !== box) return;
    for (const mon of caixa.pokemon) {
      if (filter.shinyOnly && !mon.shiny) continue;
      if (q) {
        const bate =
          numero !== undefined
            ? mon.national === numero
            : normalizar(mon.nickname).includes(q) || normalizar(nameOf(mon.national)).includes(q);
        if (!bate) continue;
      }
      out.push({ box, mon, level: boxMonLevel(mon) });
    }
  });

  if (filter.sort === "dex") out.sort((a, b) => a.mon.national - b.mon.national);
  if (filter.sort === "level") out.sort((a, b) => (b.level ?? -1) - (a.level ?? -1));
  return out;
}

/** Entrada com ficha: gravada depois de o PC passar a guardar tudo. */
export function isFullBoxMon(mon: StoredBoxMon): mon is Gen3BoxMon {
  return mon.ivs !== undefined && mon.evs !== undefined && mon.experience !== undefined && mon.nature !== undefined;
}

/**
 * Um pokémon de caixa com a cara de um do time, para a mesma ficha servir. A
 * caixa não guarda status: saem da fórmula com os status base da espécie, e o
 * HP vem cheio — o PC cura quem entra.
 */
export function boxMonAsMember(mon: Gen3BoxMon, level: number, base: StatSpread): Gen3PartyMember {
  const s = expectedGen3Stats(base, mon.ivs, mon.evs, level, mon.nature, mon.national);
  return { ...mon, level, stats: { ...s, maxHp: s.hp } };
}
