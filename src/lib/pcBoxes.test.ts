import { describe, it, expect } from "vitest";
import { listPc, type StoredBox } from "./pcBoxes";

const mon = (national: number, nickname: string, extra: object = {}) => ({ national, nickname, ...extra });
const caixas: StoredBox[] = [
  {
    name: "BOX1",
    pokemon: [
      mon(252, "TREECKO", { slot: 0, experience: 135, shiny: false }), // medium-slow: nv 5
      mon(263, "ZIGZAG", { slot: 3, experience: 1_000_000, shiny: true }), // medium: nv 100
    ],
  },
  { name: "BOX2", pokemon: [mon(25, "PIKACHU", { slot: 1, experience: 125 })] }, // medium: nv 5
  // Entrada gravada antes de o PC guardar a ficha: sem experiência.
  { name: "BOX3", pokemon: [mon(1, "BULBASAUR")] },
];
const nomes: Record<number, string> = { 252: "Treecko", 263: "Zigzagoon", 25: "Pikachu", 1: "Bulbasaur" };
const nameOf = (n: number) => nomes[n] ?? `#${n}`;
const base = { query: "", box: "all" as const, shinyOnly: false, sort: "box" as const };

describe("listPc", () => {
  it("todas as caixas, na ordem delas, com nível pela experiência", () => {
    const r = listPc(caixas, base, nameOf);
    expect(r.map((x) => [x.box, x.mon.nickname, x.level])).toEqual([
      [0, "TREECKO", 5],
      [0, "ZIGZAG", 100],
      [1, "PIKACHU", 5],
      [2, "BULBASAUR", null],
    ]);
  });

  it("busca pelo apelido, pela espécie ou pelo número, sem ligar para caixa e acento", () => {
    expect(listPc(caixas, { ...base, query: "zigzagoon" }, nameOf).map((x) => x.mon.national)).toEqual([263]);
    expect(listPc(caixas, { ...base, query: "zigZ" }, nameOf).map((x) => x.mon.national)).toEqual([263]);
    expect(listPc(caixas, { ...base, query: "#25" }, nameOf).map((x) => x.mon.national)).toEqual([25]);
    expect(listPc(caixas, { ...base, query: "25" }, nameOf).map((x) => x.mon.national)).toEqual([25]);
    expect(listPc(caixas, { ...base, query: "pikachú" }, nameOf).map((x) => x.mon.national)).toEqual([25]);
  });

  it("uma caixa só e só shiny", () => {
    expect(listPc(caixas, { ...base, box: 1 }, nameOf).map((x) => x.mon.national)).toEqual([25]);
    expect(listPc(caixas, { ...base, shinyOnly: true }, nameOf).map((x) => x.mon.national)).toEqual([263]);
  });

  it("por número e por nível (maior primeiro, sem nível no fim)", () => {
    expect(listPc(caixas, { ...base, sort: "dex" }, nameOf).map((x) => x.mon.national)).toEqual([1, 25, 252, 263]);
    expect(listPc(caixas, { ...base, sort: "level" }, nameOf).map((x) => x.mon.national)).toEqual([263, 252, 25, 1]);
  });
});

describe("boxMonAsMember", () => {
  it("calcula os status pela fórmula de Gen 3, HP cheio", async () => {
    const { boxMonAsMember, isFullBoxMon } = await import("./pcBoxes");
    const treecko = {
      slot: 0, national: 252, nickname: "TREECKO", nature: 0,
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: [], friendship: 70, experience: 1_059_860, shiny: false, abilitySlot: 0 as const, personality: 0,
    };
    expect(isFullBoxMon(treecko)).toBe(true);
    expect(isFullBoxMon({ national: 1, nickname: "B" })).toBe(false);
    // Treecko: 40/45/35/65/55/70; nv 100, IV 31, Hardy (neutra).
    const m = boxMonAsMember(treecko, 100, { hp: 40, atk: 45, def: 35, spa: 65, spd: 55, spe: 70 });
    expect(m.level).toBe(100);
    expect(m.stats).toEqual({ hp: 221, maxHp: 221, atk: 126, def: 106, spa: 166, spd: 146, spe: 176 });
  });
});
