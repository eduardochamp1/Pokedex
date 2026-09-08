import { describe, expect, it } from "vitest";
import {
  buildNameIndex,
  extractIdFromUrl,
  intersectNames,
  pageOf,
  searchNames,
  sortNamesById,
  totalPagesOf,
} from "./filters";

const RESULTS = [
  { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
  { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
  { name: "charmeleon", url: "https://pokeapi.co/api/v2/pokemon/5/" },
  { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon/6/" },
  { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/" },
  { name: "vulpix", url: "https://pokeapi.co/api/v2/pokemon/37/" },
  { name: "moltres", url: "https://pokeapi.co/api/v2/pokemon/146/" },
  { name: "charizard-mega-x", url: "https://pokeapi.co/api/v2/pokemon/10034/" },
];
const INDEX = buildNameIndex(RESULTS);

describe("extractIdFromUrl", () => {
  it("le o id com e sem barra final", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25")).toBe(25);
  });

  it("devolve undefined para url sem id", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/pikachu")).toBeUndefined();
  });
});

describe("buildNameIndex", () => {
  it("mapeia nome para id", () => {
    expect(INDEX.get("pikachu")).toBe(25);
    expect(INDEX.get("charizard-mega-x")).toBe(10034);
  });

  it("ignora entradas sem id numerico", () => {
    expect(buildNameIndex([{ name: "x", url: "/pokemon/x" }]).size).toBe(0);
  });
});

describe("intersectNames", () => {
  it("uma fonte devolve a propria lista sem duplicatas", () => {
    expect(intersectNames([["a", "b", "a"]])).toEqual(["a", "b"]);
  });

  it("intersecta multiplas fontes", () => {
    const type = ["charmander", "charmeleon", "charizard", "vulpix", "moltres"];
    const generation = ["charmander", "charmeleon", "charizard", "vulpix", "moltres", "pikachu"];
    expect(intersectNames([type, generation])).toEqual([
      "charmander",
      "charmeleon",
      "charizard",
      "vulpix",
      "moltres",
    ]);
  });

  // Regressao: os filtros truncavam cada fonte antes de intersectar, o que
  // derrubava resultados legitimos (fogo + gen I devolvia 5 em vez de 12).
  it("nao perde itens que estao em todas as fontes, mesmo em listas longas", () => {
    const todos = Array.from({ length: 400 }, (_, i) => `p${i}`);
    const pares = todos.filter((_, i) => i % 2 === 0);
    const result = intersectNames([todos, pares]);
    expect(result).toHaveLength(200);
    expect(result).toContain("p398");
  });

  it("fonte vazia zera a interseccao", () => {
    expect(intersectNames([["a"], []])).toEqual([]);
  });

  it("sem fontes devolve vazio", () => {
    expect(intersectNames([])).toEqual([]);
  });
});

describe("sortNamesById", () => {
  it("ordena pelo id da pokedex", () => {
    expect(sortNamesById(["pikachu", "bulbasaur", "charizard"], INDEX)).toEqual([
      "bulbasaur",
      "charizard",
      "pikachu",
    ]);
  });

  it("joga desconhecidos para o fim, em ordem alfabetica", () => {
    expect(sortNamesById(["zzz", "pikachu", "aaa"], INDEX)).toEqual([
      "pikachu",
      "aaa",
      "zzz",
    ]);
  });
});

describe("searchNames", () => {
  it("acha por substring, nao so por nome exato", () => {
    expect(searchNames("char", INDEX)).toEqual([
      "charmander",
      "charmeleon",
      "charizard",
      "charizard-mega-x",
    ]);
  });

  it("prioriza match exato, depois prefixo, depois substring", () => {
    const index = buildNameIndex([
      { name: "mega-charizard-fake", url: "/pokemon/900/" },
      { name: "charizard-mega-x", url: "/pokemon/10034/" },
      { name: "charizard", url: "/pokemon/6/" },
    ]);
    expect(searchNames("charizard", index)).toEqual([
      "charizard",
      "charizard-mega-x",
      "mega-charizard-fake",
    ]);
  });

  it("aceita busca por id exato", () => {
    expect(searchNames("25", INDEX)).toEqual(["pikachu"]);
    expect(searchNames("99999", INDEX)).toEqual([]);
  });

  it("ignora caixa e espacos em volta", () => {
    expect(searchNames("  PIKA ", INDEX)).toEqual(["pikachu"]);
  });

  it("query vazia nao devolve nada", () => {
    expect(searchNames("   ", INDEX)).toEqual([]);
  });

  it("respeita o limite", () => {
    expect(searchNames("char", INDEX, 2)).toHaveLength(2);
  });
});

describe("pageOf / totalPagesOf", () => {
  const items = Array.from({ length: 55 }, (_, i) => i);

  it("fatia a pagina pedida", () => {
    expect(pageOf(items, 0, 25)).toHaveLength(25);
    expect(pageOf(items, 2, 25)).toEqual([50, 51, 52, 53, 54]);
    expect(pageOf(items, 9, 25)).toEqual([]);
  });

  it("conta as paginas necessarias", () => {
    expect(totalPagesOf(55, 25)).toBe(3);
    expect(totalPagesOf(25, 25)).toBe(1);
  });

  // Regressao: a paginacao mostrava "1 de 0" em selecao vazia.
  it("nunca devolve zero pagina", () => {
    expect(totalPagesOf(0, 25)).toBe(1);
  });
});
