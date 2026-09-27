import { describe, it, expect } from "vitest";
import { expForLevel, growthRateOf, levelFromExp } from "./gen3Level";

describe("expForLevel", () => {
  // Nível 5 e 100 de cada curva, como a PokéAPI (/growth-rate) os lista.
  it.each([
    ["slow", 156, 1_250_000],
    ["medium", 125, 1_000_000],
    ["fast", 100, 800_000],
    ["medium-slow", 135, 1_059_860],
    ["slow-then-very-fast", 237, 600_000],
    ["fast-then-very-slow", 65, 1_640_000],
  ] as const)("%s", (rate, lv5, lv100) => {
    expect(expForLevel(rate, 1)).toBe(0);
    expect(expForLevel(rate, 5)).toBe(lv5);
    expect(expForLevel(rate, 100)).toBe(lv100);
  });

  it("cresce nível a nível em todas as curvas", () => {
    for (const rate of ["slow", "medium", "fast", "medium-slow", "slow-then-very-fast", "fast-then-very-slow"] as const) {
      for (let n = 2; n <= 100; n++) expect(expForLevel(rate, n)).toBeGreaterThan(expForLevel(rate, n - 1));
    }
  });
});

describe("levelFromExp", () => {
  it("exato na fronteira e logo antes dela", () => {
    expect(levelFromExp("medium-slow", 135)).toBe(5);
    expect(levelFromExp("medium-slow", 134)).toBe(4);
    expect(levelFromExp("medium", 0)).toBe(1);
  });
  it("não passa de 100", () => {
    expect(levelFromExp("fast", 9_999_999)).toBe(100);
  });
});

describe("growthRateOf", () => {
  it("pela tabela local", () => {
    expect(growthRateOf(1)).toBe("medium-slow"); // Bulbasaur
    expect(growthRateOf(258)).toBe("medium-slow"); // Mudkip
    expect(growthRateOf(10)).toBe("medium"); // Caterpie
    expect(growthRateOf(290)).toBe("slow-then-very-fast"); // Nincada
    expect(growthRateOf(386)).toBe("slow"); // Deoxys
    expect(growthRateOf(387)).toBeUndefined();
  });
});
