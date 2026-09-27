import { describe, expect, it } from "vitest";
import { normalize, searchCommands, type CommandItem } from "./commandSearch";

const item = (kind: CommandItem["kind"], label: string, to = "/", extra: string[] = []): CommandItem => ({
  kind,
  label,
  to,
  keywords: extra,
});

const ITENS: CommandItem[] = [
  item("page", "Pokédex", "/"),
  item("page", "Time", "/time"),
  item("page", "Quiz", "/quiz", ["quem é esse pokémon"]),
  item("pokemon", "Pikachu", "/pokemon/pikachu"),
  item("pokemon", "Pichu", "/pokemon/pichu"),
  item("pokemon", "Raichu", "/pokemon/raichu"),
  item("pokemon", "Mr. Mime", "/pokemon/mr-mime"),
  item("region", "Hoenn", "/mapa?region=hoenn"),
  item("lore", "Equipe Magma", "/lore?aba=villains"),
  item("ability", "Levitate", "/habilidade/levitate"),
];

describe("normalize", () => {
  it("tira acento, caixa e hífen", () => {
    expect(normalize("Pokédex")).toBe("pokedex");
    expect(normalize("mr-mime")).toBe("mr mime");
    expect(normalize("  Équipe  ")).toBe("equipe");
  });
});

describe("searchCommands", () => {
  it("vazio não devolve nada", () => {
    expect(searchCommands("", ITENS)).toEqual([]);
    expect(searchCommands("   ", ITENS)).toEqual([]);
  });

  it("acento e caixa não importam", () => {
    expect(searchCommands("pokedex", ITENS)[0].label).toBe("Pokédex");
  });

  it("exato vem antes de prefixo, prefixo antes de trecho", () => {
    const r = searchCommands("pichu", ITENS).map((x) => x.label);
    expect(r[0]).toBe("Pichu");
    const chu = searchCommands("chu", ITENS).map((x) => x.label);
    expect(chu).toEqual(expect.arrayContaining(["Pikachu", "Pichu", "Raichu"]));
  });

  it("acha pelo começo de uma palavra do meio", () => {
    expect(searchCommands("magma", ITENS)[0].label).toBe("Equipe Magma");
    expect(searchCommands("mime", ITENS)[0].label).toBe("Mr. Mime");
  });

  /** Palavra inteira vale mais que prefixo parcial: "magma" quer a Equipe, não o Magmar. */
  it("palavra inteira ganha de prefixo parcial", () => {
    const r = searchCommands("magma", [...ITENS, item("pokemon", "Magmar")]).map((x) => x.label);
    expect(r.indexOf("Equipe Magma")).toBeLessThan(r.indexOf("Magmar"));
  });

  it("acha por palavra-chave, não só pelo rótulo", () => {
    expect(searchCommands("quem e esse", ITENS)[0].label).toBe("Quiz");
  });

  it("limita por tipo", () => {
    const muitos = Array.from({ length: 30 }, (_, i) => item("pokemon", `Poke${i}`));
    const r = searchCommands("poke", muitos, { perKind: 5 });
    expect(r).toHaveLength(5);
  });

  it("com o mesmo encaixe, página vem antes de pokémon", () => {
    const r = searchCommands("time", [item("pokemon", "Timeburn"), item("page", "Time", "/time")]);
    expect(r[0].kind).toBe("page");
  });
});
