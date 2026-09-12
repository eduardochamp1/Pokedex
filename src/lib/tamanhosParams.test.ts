import { describe, expect, it } from "vitest";
import { parseTamanhosParams, toSearchParams } from "./tamanhosParams";

describe("parseTamanhosParams", () => {
  it("vazio devolve lista vazia", () => {
    expect(parseTamanhosParams(new URLSearchParams())).toEqual([]);
  });

  it("le lista de nomes separada por virgula", () => {
    expect(
      parseTamanhosParams(new URLSearchParams("p=wailord,joltik,pikachu"))
    ).toEqual(["wailord", "joltik", "pikachu"]);
  });

  it("normaliza para caixa baixa e remove espacos", () => {
    expect(
      parseTamanhosParams(new URLSearchParams("p=%20Wailord%20,%20Joltik"))
    ).toEqual(["wailord", "joltik"]);
  });

  it("limita a 6 nomes", () => {
    const p = new URLSearchParams("p=a,b,c,d,e,f,g,h");
    expect(parseTamanhosParams(p)).toHaveLength(6);
  });

  it("remove duplicatas preservando ordem", () => {
    expect(parseTamanhosParams(new URLSearchParams("p=a,b,a,c"))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("toSearchParams", () => {
  it("vazio produz string vazia", () => {
    expect(toSearchParams([]).toString()).toBe("");
  });

  it("faz ida e volta", () => {
    const s = toSearchParams(["wailord", "joltik"]);
    expect(parseTamanhosParams(s)).toEqual(["wailord", "joltik"]);
  });
});
