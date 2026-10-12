import { describe, expect, it } from "vitest";
import { sectionOf } from "./deviceNav";

describe("sectionOf", () => {
  it("a raiz e a ficha são a mesma aba", () => {
    expect(sectionOf("/")).toBe("");
    expect(sectionOf("/pokemon/pikachu")).toBe("");
  });

  it("as outras abas saem pelo primeiro segmento", () => {
    expect(sectionOf("/lore")).toBe("lore");
    expect(sectionOf("/habilidade/static")).toBe("habilidade");
  });
});
