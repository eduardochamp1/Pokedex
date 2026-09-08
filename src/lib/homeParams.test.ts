import { describe, expect, it } from "vitest";
import { parseHomeParams, toSearchParams, SORTS } from "./homeParams";

describe("parseHomeParams", () => {
  it("vazio devolve o padrao", () => {
    const p = parseHomeParams(new URLSearchParams());
    expect(p).toEqual({
      search: "",
      type: undefined,
      generation: undefined,
      rarity: undefined,
      sort: "id",
      page: 0,
    });
  });

  it("le todos os criterios", () => {
    const p = parseHomeParams(
      new URLSearchParams("q=char&tipo=fire&ger=1&rar=legendary&ord=nome&p=3")
    );
    expect(p.search).toBe("char");
    expect(p.type).toBe("fire");
    expect(p.generation).toBe(1);
    expect(p.rarity).toBe("legendary");
    expect(p.sort).toBe("nome");
    expect(p.page).toBe(2); // p=3 na URL e 1-based
  });

  it("recusa tipo que nao existe", () => {
    expect(parseHomeParams(new URLSearchParams("tipo=banana")).type).toBeUndefined();
  });

  it("recusa geracao fora de 1..9", () => {
    expect(parseHomeParams(new URLSearchParams("ger=99")).generation).toBeUndefined();
    expect(parseHomeParams(new URLSearchParams("ger=0")).generation).toBeUndefined();
  });

  it("recusa ordenacao desconhecida e cai no padrao", () => {
    expect(parseHomeParams(new URLSearchParams("ord=xyz")).sort).toBe("id");
  });

  it("pagina negativa vira zero", () => {
    expect(parseHomeParams(new URLSearchParams("p=-5")).page).toBe(0);
  });
});

describe("toSearchParams", () => {
  it("omite o que esta no padrao — URL limpa", () => {
    const s = toSearchParams({
      search: "",
      type: undefined,
      generation: undefined,
      rarity: undefined,
      sort: "id",
      page: 0,
    });
    expect(s.toString()).toBe("");
  });

  it("faz ida e volta", () => {
    const original = {
      search: "char",
      type: "fire",
      generation: 3,
      rarity: undefined,
      sort: "nome" as const,
      page: 2,
    };
    expect(parseHomeParams(toSearchParams(original))).toEqual(original);
  });
});

describe("SORTS", () => {
  it("tem id como primeira opcao", () => {
    expect(SORTS[0].id).toBe("id");
  });
});
