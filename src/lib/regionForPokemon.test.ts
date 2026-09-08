import { describe, expect, it } from "vitest";
import {
  generationNumberFromName,
  regionIdForGeneration,
  regionIdForPokemon,
  regionIdForSignaturePokemon,
} from "./regionForPokemon";

describe("generationNumberFromName", () => {
  it("le romanos de i a ix", () => {
    expect(generationNumberFromName("generation-i")).toBe(1);
    expect(generationNumberFromName("generation-iv")).toBe(4);
    expect(generationNumberFromName("generation-ix")).toBe(9);
  });

  it("devolve undefined para entrada invalida ou ausente", () => {
    expect(generationNumberFromName("generation-x")).toBeUndefined();
    expect(generationNumberFromName(undefined)).toBeUndefined();
    expect(generationNumberFromName(null)).toBeUndefined();
  });
});

describe("regionIdForGeneration", () => {
  it("mapeia geracao para a regiao principal", () => {
    expect(regionIdForGeneration("generation-i")).toBe("kanto");
    expect(regionIdForGeneration("generation-iv")).toBe("sinnoh");
    expect(regionIdForGeneration("generation-ix")).toBe("paldea");
  });
});

describe("regionIdForSignaturePokemon", () => {
  it("acha a regiao de um emblematico", () => {
    expect(regionIdForSignaturePokemon("mewtwo")).toBe("kanto");
  });

  it("ignora caixa", () => {
    expect(regionIdForSignaturePokemon("MEWTWO")).toBe("kanto");
  });

  it("devolve undefined para quem nao e emblematico", () => {
    expect(regionIdForSignaturePokemon("pidgey")).toBeUndefined();
  });
});

// Regressao: o link "ver no mapa" mandava /mapa?region=<nome-do-pokemon>,
// e o mapa indexa por id de regiao — o link nunca abria dossier nenhum.
describe("regionIdForPokemon", () => {
  it("resolve um id de regiao valido, nao o nome do pokemon", () => {
    expect(regionIdForPokemon("pikachu", "generation-i")).toBe("kanto");
  });

  it("prefere a lista de emblematicos a geracao", () => {
    // Mewtwo e emblematico de Kanto mesmo consultado com outra geracao.
    expect(regionIdForPokemon("mewtwo", "generation-v")).toBe("kanto");
  });

  it("cai na geracao quando o pokemon nao e emblematico", () => {
    expect(regionIdForPokemon("gible", "generation-iv")).toBe("sinnoh");
  });

  it("devolve undefined quando nao da para decidir", () => {
    expect(regionIdForPokemon("gible", undefined)).toBeUndefined();
  });
});
