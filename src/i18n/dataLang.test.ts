import { describe, expect, it } from "vitest";
import { pickLocalized } from "../lib/localize";
import { tGenus, tHabitat, tType } from "../data/i18n";

const entradas = [
  { language: { name: "en" }, texto: "Seed Pokémon" },
  { language: { name: "pt-br" }, texto: "Pokémon Semente" },
];

describe("dados da PokéAPI no idioma do site", () => {
  it("pickLocalized prefere pt-br em pt e só en em en", () => {
    expect(pickLocalized(entradas, (e) => e.texto, "pt")).toBe("Pokémon Semente");
    expect(pickLocalized(entradas, (e) => e.texto, "en")).toBe("Seed Pokémon");
  });

  /** Sem inglês na lista, o modo EN ainda mostra algo em vez de nada. */
  it("em en, sem entrada en, cai na primeira", () => {
    expect(pickLocalized([{ language: { name: "ja" }, texto: "たね" }], (e) => e.texto, "en")).toBe("たね");
  });

  it("tipo, habitat e espécie", () => {
    expect(tType("fire", "pt")).toBe("Fogo");
    expect(tType("fire", "en")).toBe("Fire");
    expect(tHabitat("waters-edge", "pt")).toBe("Beira d'água");
    expect(tHabitat("waters-edge", "en")).toBe("Waters Edge");
    expect(tGenus("Seed Pokémon", "pt")).toBe("Pokémon Semente");
    expect(tGenus("Seed Pokémon", "en")).toBe("Seed Pokémon");
  });
});
