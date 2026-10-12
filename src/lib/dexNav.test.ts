import { describe, expect, it } from "vitest";
import { farStep, neighbor } from "./dexNav";

const LISTA = ["bulbasaur", "ivysaur", "venusaur"];

describe("neighbor", () => {
  it("anda um para frente e um para trás", () => {
    expect(neighbor(LISTA, "ivysaur", 1)).toBe("venusaur");
    expect(neighbor(LISTA, "ivysaur", -1)).toBe("bulbasaur");
  });

  it("nas pontas não dá a volta", () => {
    expect(neighbor(LISTA, "venusaur", 1)).toBeUndefined();
    expect(neighbor(LISTA, "bulbasaur", -1)).toBeUndefined();
  });

  it("sem seleção, ou com ela fora da lista, entra pela ponta", () => {
    expect(neighbor(LISTA, undefined, 1)).toBe("bulbasaur");
    expect(neighbor(LISTA, undefined, -1)).toBe("venusaur");
    expect(neighbor(LISTA, "mew", 1)).toBe("bulbasaur");
  });

  it("o nome da URL pode vir em maiúsculas", () => {
    expect(neighbor(LISTA, "Bulbasaur", 1)).toBe("ivysaur");
  });

  it("lista vazia não tem vizinho", () => {
    expect(neighbor([], "mew", 1)).toBeUndefined();
  });
});

describe("farStep", () => {
  it("sem filtro, anda pelo número e diz a página do alvo", () => {
    const o = { order: null, current: "eevee", id: 133, total: 1025 };
    expect(farStep(o, 1, 48)).toEqual({ target: "134", page: 2 });
    expect(farStep(o, -1, 48)).toEqual({ target: "132", page: 2 });
    expect(farStep({ ...o, id: 48 }, 1, 48)).toEqual({ target: "49", page: 1 });
    expect(farStep({ ...o, id: 49 }, -1, 48)).toEqual({ target: "48", page: 0 });
  });

  it("sem filtro, para nas pontas da Pokédex e ignora formas alternativas", () => {
    expect(farStep({ order: null, current: "bulbasaur", id: 1, total: 1025 }, -1, 48)).toBeUndefined();
    expect(farStep({ order: null, current: "pecharunt", id: 1025, total: 1025 }, 1, 48)).toBeUndefined();
    expect(farStep({ order: null, current: "charizard-mega-x", id: 10034, total: 1025 }, 1, 48)).toBeUndefined();
    expect(farStep({ order: null, current: "eevee", id: undefined, total: 1025 }, 1, 48)).toBeUndefined();
  });

  it("com filtro, anda pela lista filtrada", () => {
    const order = ["a", "b", "c", "d", "e"];
    const o = { order, current: "D", id: 999, total: 1025 };
    expect(farStep(o, 1, 2)).toEqual({ target: "e", page: 2 });
    expect(farStep(o, -1, 2)).toEqual({ target: "c", page: 1 });
    expect(farStep({ ...o, current: "e" }, 1, 2)).toBeUndefined();
    expect(farStep({ ...o, current: "fora-do-filtro" }, 1, 2)).toBeUndefined();
  });
});
