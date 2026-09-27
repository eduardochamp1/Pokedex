import { describe, it, expect } from "vitest";
import { suggestTypes, speciesForCombo } from "./teamSuggest";
import type { TeamMember } from "./teamAnalysis";

// Três pokémon de Fogo: Água, Pedra e Terra viram pontos fracos.
const fogo: TeamMember[] = [
  { name: "charmander", types: ["fire"] },
  { name: "vulpix", types: ["fire"] },
  { name: "ponyta", types: ["fire"] },
];

describe("suggestTypes", () => {
  it("time vazio não sugere nada", () => {
    expect(suggestTypes([])).toEqual([]);
  });

  it("o melhor candidato conserta os pontos fracos do time de Fogo", () => {
    const s = suggestTypes(fogo);
    expect(s.length).toBeGreaterThan(0);
    const melhor = s[0];
    // Água, Pedra e Terra: a sugestão resiste ou é imune a pelo menos dois deles.
    expect(melhor.fixes.length).toBeGreaterThanOrEqual(2);
    expect(melhor.fixes.every((t) => ["water", "rock", "ground"].includes(t))).toBe(true);
    // e não é Fogo puro de novo
    expect(melhor.types).not.toEqual(["fire"]);
  });

  it("não repete combinação que o time já tem e ordena por pontuação", () => {
    const s = suggestTypes(fogo, 20);
    expect(s.some((c) => c.types.length === 1 && c.types[0] === "fire")).toBe(false);
    for (let i = 1; i < s.length; i++) expect(s[i - 1].score).toBeGreaterThanOrEqual(s[i].score);
  });

  it("diz o que a sugestão passa a acertar forte", () => {
    const s = suggestTypes(fogo, 171);
    const agua = s.find((c) => c.types.length === 1 && c.types[0] === "water");
    // Fogo já acerta Planta, Gelo, Inseto e Aço; Água soma Fogo, Pedra e Terra.
    expect(agua?.covers).toEqual(expect.arrayContaining(["fire", "rock", "ground"]));
  });
});

describe("speciesForCombo", () => {
  const listas: Record<string, string[]> = {
    water: ["squirtle", "wooper", "quagsire", "mudkip", "marshtomp", "kyogre-primal"],
    ground: ["wooper", "quagsire", "marshtomp", "sandshrew"],
  };
  const ids: Record<string, number> = {
    squirtle: 7, wooper: 194, quagsire: 195, mudkip: 258, marshtomp: 259, sandshrew: 27, "kyogre-primal": 10078,
  };

  it("dupla: quem está nas duas listas; só formas base; em ordem de dex", () => {
    expect(speciesForCombo(["water", "ground"], listas, ids)).toEqual(["wooper", "quagsire", "marshtomp"]);
  });

  it("simples: quem tem só aquele tipo", () => {
    expect(speciesForCombo(["water"], listas, ids)).toEqual(["squirtle", "mudkip"]);
  });

  it("limite de dex (Gen 3 = até 386)", () => {
    expect(speciesForCombo(["water", "ground"], listas, ids, 194)).toEqual(["wooper"]);
  });
});
