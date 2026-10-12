import { describe, expect, it } from "vitest";
import { neighbor } from "./dexNav";

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
