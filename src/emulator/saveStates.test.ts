import { describe, expect, it } from "vitest";
import {
  autoStateFileName,
  describeAge,
  parseStateFileName,
  romBaseName,
  slotsForRom,
  stateFileName,
} from "./saveStates";

describe("romBaseName", () => {
  it("tira diretorio e extensao", () => {
    expect(romBaseName("/data/games/Emerald.gba")).toBe("Emerald");
    expect(romBaseName("Pokemon - Leaf Green.gba")).toBe("Pokemon - Leaf Green");
  });

  it("preserva pontos que nao sao a extensao", () => {
    expect(romBaseName("Pokemon Unbound (v2.1.1.1).gba")).toBe(
      "Pokemon Unbound (v2.1.1.1)"
    );
  });

  it("aceita as tres extensoes, em qualquer caixa", () => {
    expect(romBaseName("jogo.GB")).toBe("jogo");
    expect(romBaseName("jogo.Gbc")).toBe("jogo");
    expect(romBaseName("jogo.gba")).toBe("jogo");
  });
});

describe("stateFileName / parseStateFileName", () => {
  it("ida e volta", () => {
    const name = stateFileName("Emerald.gba", 3);
    expect(name).toBe("Emerald.ss3");
    expect(parseStateFileName(name)).toEqual({ base: "Emerald", slot: 3 });
  });

  it("nome com ponto sobrevive ao round-trip", () => {
    const rom = "Pokemon Unbound (v2.1.1.1).gba";
    const parsed = parseStateFileName(stateFileName(rom, 6));
    expect(parsed).toEqual({ base: "Pokemon Unbound (v2.1.1.1)", slot: 6 });
  });

  it("ignora o que nao e estado numerado", () => {
    expect(parseStateFileName("Emerald.sav")).toBeNull();
    expect(parseStateFileName("Emerald.gba")).toBeNull();
    // o auto-state nao tem numero: nao ocupa slot
    expect(parseStateFileName("Emerald_auto.ss")).toBeNull();
  });
});

describe("autoStateFileName", () => {
  it("segue o mesmo formato que o core monta em loadGame", () => {
    expect(autoStateFileName("Emerald.gba")).toBe("Emerald_auto.ss");
  });
});

describe("slotsForRom", () => {
  const entries = [
    { name: "Emerald.ss1", size: 700_000, modified: 1_000 },
    { name: "Emerald.ss4", size: 700_000 },
    { name: "Emerald_auto.ss", size: 700_000 },
    { name: "LeafGreen.ss2", size: 500_000 },
  ];

  it("marca so os slots da ROM atual", () => {
    const slots = slotsForRom(entries, "Emerald.gba");
    expect(slots.map((s) => s.exists)).toEqual([
      true,
      false,
      false,
      true,
      false,
      false,
    ]);
  });

  it("nao deixa o estado de outra ROM vazar para os slots desta", () => {
    const slots = slotsForRom(entries, "LeafGreen.gba");
    expect(slots.filter((s) => s.exists).map((s) => s.slot)).toEqual([2]);
  });

  it("sem ROM carregada, todos vazios", () => {
    expect(slotsForRom(entries, undefined).every((s) => !s.exists)).toBe(true);
  });

  it("devolve sempre os seis slots, em ordem", () => {
    const slots = slotsForRom([], "Emerald.gba");
    expect(slots.map((s) => s.slot)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("carrega tamanho e data quando o FS informou", () => {
    const [first] = slotsForRom(entries, "Emerald.gba");
    expect(first).toEqual({
      slot: 1,
      exists: true,
      size: 700_000,
      modified: 1_000,
    });
  });
});

describe("describeAge", () => {
  const now = Date.UTC(2026, 2, 12, 14, 7);

  it("minutos e horas recentes", () => {
    expect(describeAge(now - 10_000, now)).toBe("agora");
    expect(describeAge(now - 5 * 60_000, now)).toBe("há 5 min");
    expect(describeAge(now - 3 * 3_600_000, now)).toBe("há 3 h");
  });

  it("cai para data quando passa de um dia", () => {
    expect(describeAge(now - 2 * 86_400_000, now)).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  it("sem data do FS, ainda diz que existe", () => {
    expect(describeAge(undefined, now)).toBe("gravado");
  });
});
