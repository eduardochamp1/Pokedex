import { describe, expect, it } from "vitest";
import { defenseProfile } from "./typeDefense";

describe("defenseProfile", () => {
  it("agrupa por multiplicador, do pior para o melhor", () => {
    const p = defenseProfile(["fire", "flying"]);
    // Rocha bate 2x em Fogo e 2x em Voador -> 4x
    expect(p.find((g) => g.multiplier === 4)?.types).toContain("rock");
  });

  it("acha a imunidade de tipo duplo", () => {
    // Terra nao afeta Voador
    const p = defenseProfile(["fire", "flying"]);
    expect(p.find((g) => g.multiplier === 0)?.types).toContain("ground");
  });

  it("nao inclui grupo de 1x — neutro nao e informacao", () => {
    const p = defenseProfile(["normal"]);
    expect(p.some((g) => g.multiplier === 1)).toBe(false);
  });

  it("tipo unico funciona", () => {
    const p = defenseProfile(["water"]);
    expect(p.find((g) => g.multiplier === 2)?.types.sort()).toEqual([
      "electric",
      "grass",
    ]);
  });

  it("ordena do multiplicador maior para o menor", () => {
    const p = defenseProfile(["steel", "rock"]);
    const ms = p.map((g) => g.multiplier);
    expect([...ms].sort((a, b) => b - a)).toEqual(ms);
  });

  it("lista vazia devolve vazio", () => {
    expect(defenseProfile([])).toEqual([]);
  });
});
