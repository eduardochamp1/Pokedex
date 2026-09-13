import { describe, expect, it } from "vitest";
import { VERSION_GROUPS, versionGroupLabel, versionGroupOrder } from "./versionGroups";

describe("VERSION_GROUPS", () => {
  it("nao repete id", () => {
    const ids = VERSION_GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("os lancamentos japoneses de 1996 vem antes de Red/Blue", () => {
    // A API os devolve por ULTIMO (id 28 e 29) porque foram inseridos depois.
    // Confiar naquela ordem fazia a tela do Pikachu abrir em "Blue (JP)".
    expect(versionGroupOrder("red-green-japan")).toBeLessThan(
      versionGroupOrder("red-blue")
    );
    expect(versionGroupOrder("blue-japan")).toBeLessThan(
      versionGroupOrder("scarlet-violet")
    );
  });

  it("a cronologia de linha principal esta crescente", () => {
    const linha = [
      "red-blue",
      "gold-silver",
      "ruby-sapphire",
      "diamond-pearl",
      "black-white",
      "x-y",
      "sun-moon",
      "sword-shield",
      "scarlet-violet",
    ];
    const ordens = linha.map(versionGroupOrder);
    expect(ordens).toEqual([...ordens].sort((a, b) => a - b));
  });

  it("grupo desconhecido nao quebra e vai para tras", () => {
    expect(versionGroupOrder("jogo-que-nao-existe")).toBe(-1);
    expect(versionGroupLabel("jogo-que-nao-existe")).toBe("jogo-que-nao-existe");
  });

  it("rotulo conhecido vem legivel", () => {
    expect(versionGroupLabel("scarlet-violet")).toBe("Scarlet/Violet");
  });
});
