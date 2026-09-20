import { describe, it, expect } from "vitest";
import { pokemonLabel } from "./pokemonLabel";

describe("pokemonLabel", () => {
  it("capitaliza o nome simples", () => {
    expect(pokemonLabel("pikachu")).toBe("Pikachu");
    expect(pokemonLabel("groudon")).toBe("Groudon");
  });

  it("troca hífen por espaço nos nomes de duas palavras", () => {
    expect(pokemonLabel("tapu-koko")).toBe("Tapu Koko");
    expect(pokemonLabel("great-tusk")).toBe("Great Tusk");
    expect(pokemonLabel("iron-treads")).toBe("Iron Treads");
  });

  // O sufixo é o nome de uma região, não parte do nome do bicho.
  it("lê o sufixo regional como forma", () => {
    expect(pokemonLabel("ponyta-galar")).toBe("Ponyta de Galar");
    expect(pokemonLabel("weezing-galar")).toBe("Weezing de Galar");
    expect(pokemonLabel("raichu-alola")).toBe("Raichu de Alola");
  });

  // Aqui o hífen é do nome, e trocá-lo por espaço estragaria.
  it("preserva a pontuação dos nomes que têm a sua", () => {
    expect(pokemonLabel("ho-oh")).toBe("Ho-Oh");
    expect(pokemonLabel("kommo-o")).toBe("Kommo-o");
    expect(pokemonLabel("type-null")).toBe("Type: Null");
    expect(pokemonLabel("farfetchd")).toBe("Farfetch'd");
    expect(pokemonLabel("mr-mime")).toBe("Mr. Mime");
  });

  it("não quebra com entrada vazia ou suja", () => {
    expect(pokemonLabel("")).toBe("");
    expect(pokemonLabel("  Pikachu  ")).toBe("Pikachu");
  });
});
