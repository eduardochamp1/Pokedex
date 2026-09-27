import { describe, it, expect } from "vitest";
import { cardContent, cardFileName } from "./trainerCardImage";
import type { TrainerEntry } from "./trainerLog";

function entry(over: Partial<TrainerEntry> = {}, trainer: Partial<TrainerEntry["trainer"]> = {}): TrainerEntry {
  return {
    rom: "Pokemon - Leaf Green.gba",
    game: "frlg",
    updatedAt: 0,
    playerName: "LG",
    trainer: {
      gender: "male",
      trainerId: 15131,
      secretId: 1,
      playTime: { hours: 2, minutes: 5, seconds: 9 },
      money: 3000,
      badges: [true, true, false, false, false, false, false, false],
      visitedTowns: null,
      location: null,
      ...trainer,
    },
    party: [{ personality: 1, national: 1, nickname: "BULBASAUR", level: 5 }],
    boxes: [],
    owned: [1, 4],
    seen: [1, 4, 7],
    last: { at: 0, playSeconds: 0, owned: [], seenCount: 0, badges: [], towns: [], party: [] },
    events: [],
    ...over,
  };
}

describe("cardContent", () => {
  it("o que vai escrito no cartão", () => {
    const c = cardContent(entry(), "pt");
    expect(c.title).toBe("LG ♂");
    expect(c.subtitle).toBe("FireRed/LeafGreen · ID 15131");
    expect(c.facts).toEqual([
      ["Tempo", "2h 05min"],
      ["Dinheiro", "₽3.000"],
      ["Pokédex", "2 / 386"],
      ["Insígnias", "2 / 8"],
    ]);
    expect(c.badges).toEqual([true, true, false, false, false, false, false, false]);
    expect(c.team).toEqual([{ national: 1, label: "BULBASAUR", level: 5 }]);
  });

  it("em inglês, e sem o que o jogo não registra", () => {
    const c = cardContent(entry({ game: "rs" }, { money: null, badges: null, gender: "female" }), "en");
    expect(c.title).toBe("LG ♀");
    expect(c.facts.map(([k]) => k)).toEqual(["Time", "Pokédex"]);
    expect(c.badges).toBeNull();
  });
});

describe("cardFileName", () => {
  it("nome de arquivo sem caracteres problemáticos", () => {
    expect(cardFileName(entry({ playerName: "A/B C" }))).toBe("treinador-A-B-C-15131.png");
  });
});
