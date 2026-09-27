import { describe, it, expect } from "vitest";
import { buildTree, expandDetail, filterChains, methodsOf } from "./evolutionTrees";
import type { EvoChain } from "../data/evolutionChains";
import { EVOLUTION_CHAINS } from "../data/evolutionChains";
import { evolutionConditionText } from "./evolution";

const bulba: EvoChain = {
  id: 1,
  species: [1, 2, 3],
  edges: [
    { from: 1, to: 2, d: [{ t: "level-up", lv: 16 }] },
    { from: 2, to: 3, d: [{ t: "level-up", lv: 32 }] },
  ],
};
const eevee: EvoChain = {
  id: 67,
  species: [133, 134, 196],
  edges: [
    { from: 133, to: 134, d: [{ t: "use-item", item: "water-stone" }] },
    { from: 133, to: 196, d: [{ t: "level-up", hap: 160, time: "day" }] },
  ],
};
const kadabra: EvoChain = { id: 26, species: [63, 64, 65], edges: [{ from: 63, to: 64, d: [{ t: "level-up", lv: 16 }] }, { from: 64, to: 65, d: [{ t: "trade" }] }] };
const sozinho: EvoChain = { id: 70, species: [128], edges: [] };
const nomes: Record<number, string> = { 1: "bulbasaur", 2: "ivysaur", 3: "venusaur", 133: "eevee", 134: "vaporeon", 196: "espeon", 63: "abra", 64: "kadabra", 65: "alakazam", 128: "tauros" };
const nameOf = (n: number) => nomes[n] ?? `#${n}`;
const todas = [bulba, eevee, kadabra, sozinho];

describe("expandDetail", () => {
  it("volta ao formato da API, e a frase de sempre sai dele", () => {
    const d = expandDetail({ t: "level-up", hap: 160, time: "day" }, nameOf);
    expect(d.min_happiness).toBe(160);
    expect(d.min_level).toBeNull();
    expect(evolutionConditionText(d, "pt")).toBe("amizade 160, de dia");
    expect(evolutionConditionText(expandDetail({ t: "use-item", item: "water-stone" }, nameOf), "en")).toBe("Water Stone");
  });

  it("condições que a frase ainda não dizia: tipo de golpe e troca por espécie", () => {
    expect(evolutionConditionText(expandDetail({ t: "level-up", moveType: "fairy", hap: 160 }, nameOf), "pt")).toBe(
      "amizade 160 sabendo um golpe do tipo Fada"
    );
    expect(evolutionConditionText(expandDetail({ t: "trade", tradeFor: 616 }, () => "shelmet"), "pt")).toBe("troca por Shelmet");
  });
});

describe("methodsOf", () => {
  it("classifica cada condição, podendo ter mais de um método", () => {
    expect(methodsOf({ t: "level-up", lv: 16 })).toEqual(["level"]);
    expect(methodsOf({ t: "use-item", item: "fire-stone" })).toEqual(["item"]);
    expect(methodsOf({ t: "trade", held: "metal-coat" })).toEqual(["trade"]);
    expect(methodsOf({ t: "level-up", hap: 160, time: "night" }).sort()).toEqual(["friendship", "time"]);
    expect(methodsOf({ t: "level-up", loc: "eterna-forest" })).toEqual(["location"]);
    expect(methodsOf({ t: "level-up", held: "oval-stone", time: "day" }).sort()).toEqual(["held", "time"]);
    expect(methodsOf({ t: "shed" })).toEqual(["other"]);
  });
});

describe("filterChains", () => {
  const base = { method: "all" as const, gen: "all" as const, query: "", branched: false };

  it("por método: basta uma evolução da cadeia usar", () => {
    expect(filterChains(todas, { ...base, method: "trade" }, nameOf).map((c) => c.id)).toEqual([26]);
    expect(filterChains(todas, { ...base, method: "item" }, nameOf).map((c) => c.id)).toEqual([67]);
  });

  it("sem filtro, fora as cadeias sem evolução", () => {
    expect(filterChains(todas, base, nameOf).map((c) => c.id)).toEqual([1, 67, 26]);
  });

  it("por nome, por geração e só as que se ramificam", () => {
    expect(filterChains(todas, { ...base, query: "ivy" }, nameOf).map((c) => c.id)).toEqual([1]);
    expect(filterChains(todas, { ...base, gen: 2 }, nameOf).map((c) => c.id)).toEqual([67]);
    expect(filterChains(todas, { ...base, branched: true }, nameOf).map((c) => c.id)).toEqual([67]);
  });
});

describe("buildTree", () => {
  it("raiz com os filhos e a condição de cada um", () => {
    const t = buildTree(eevee);
    expect(t.id).toBe(133);
    expect(t.children.map((c) => c.node.id)).toEqual([134, 196]);
    expect(t.children[1].details[0]).toEqual({ t: "level-up", hap: 160, time: "day" });
  });
});

describe("os dados gerados", () => {
  it("têm as cadeias conhecidas", () => {
    const e = EVOLUTION_CHAINS.find((c) => c.species.includes(133));
    expect(e?.species).toEqual(expect.arrayContaining([134, 135, 136, 196, 197, 470, 471, 700]));
    const b = EVOLUTION_CHAINS.find((c) => c.species[0] === 1);
    expect(b?.edges[0]).toEqual({ from: 1, to: 2, d: [{ t: "level-up", lv: 16 }] });
  });
});
