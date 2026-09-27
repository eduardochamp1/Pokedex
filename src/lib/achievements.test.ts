import { describe, it, expect } from "vitest";
import { achievementsOf, newlyDone, ACHIEVEMENTS } from "./achievements";
import type { TrainerEntry } from "./trainerLog";

function entry(over: Partial<TrainerEntry> = {}, trainer: Partial<TrainerEntry["trainer"]> = {}): TrainerEntry {
  return {
    rom: "e.gba",
    game: "emerald",
    updatedAt: 0,
    playerName: "ZE",
    trainer: {
      gender: "male",
      trainerId: 1,
      secretId: 2,
      playTime: { hours: 0, minutes: 45, seconds: 0 },
      money: 3300,
      badges: Array(8).fill(false),
      visitedTowns: [0, 1],
      location: { group: 0, num: 10 },
      ...trainer,
    },
    party: [{ personality: 1, national: 258, nickname: "MUDKIP", level: 8 }],
    boxes: [],
    owned: [258],
    seen: [258, 263],
    last: { at: 0, playSeconds: 0, owned: [], seenCount: 0, badges: [], towns: [], party: [] },
    events: [],
    ...over,
  };
}

const porId = (e: TrainerEntry) => new Map(achievementsOf(e).map((a) => [a.id, a]));

describe("achievementsOf", () => {
  it("progresso de dex, com o que falta", () => {
    const a = porId(entry({ owned: Array.from({ length: 12 }, (_, i) => i + 1) }));
    expect(a.get("dex-10")).toMatchObject({ done: true, have: 12, need: 10 });
    expect(a.get("dex-50")).toMatchObject({ done: false, have: 12, need: 50 });
  });

  it("insígnias: a primeira e as oito", () => {
    const uma = porId(entry({}, { badges: [false, true, false, false, false, false, false, false] }));
    expect(uma.get("badge-1")?.done).toBe(true);
    expect(uma.get("badge-8")).toMatchObject({ done: false, have: 1, need: 8 });
  });

  it("o que o jogo não registra não aparece", () => {
    const rs = porId(entry({ game: "rs" }, { badges: null, money: null, visitedTowns: null }));
    expect(rs.has("badge-1")).toBe(false);
    expect(rs.has("money-100k")).toBe(false);
    expect(rs.has("towns-all")).toBe(false);
    const frlg = porId(entry({ game: "frlg" }, { visitedTowns: null }));
    expect(frlg.has("badge-1")).toBe(true);
    expect(frlg.has("towns-all")).toBe(false);
  });

  it("time cheio, nível 50 no time ou no PC, shiny no PC", () => {
    const seis = Array.from({ length: 6 }, (_, i) => ({ personality: i, national: 1, nickname: "B", level: 5 }));
    expect(porId(entry({ party: seis })).get("team-6")?.done).toBe(true);
    // 125000 de experiência numa curva "medium" (Pikachu) é o nível 50.
    const pc = [{ name: "BOX1", pokemon: [{ national: 25, nickname: "P", experience: 125_000, shiny: true }] }];
    const a = porId(entry({ boxes: pc }));
    expect(a.get("level-50")?.done).toBe(true);
    expect(a.get("level-100")?.done).toBe(false);
    expect(a.get("shiny")?.done).toBe(true);
  });

  it("evolução pela linha do tempo; tempo de jogo e dinheiro", () => {
    const evoluiu = entry({
      events: [{ at: 0, playSeconds: 0, kind: "evolved", nickname: "M", from: 258, to: 259 }],
    }, { playTime: { hours: 10, minutes: 0, seconds: 0 }, money: 100_000 });
    const a = porId(evoluiu);
    expect(a.get("evolved")?.done).toBe(true);
    expect(a.get("time-10h")?.done).toBe(true);
    expect(a.get("money-100k")?.done).toBe(true);
  });

  it("toda conquista tem nome nas duas línguas", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.pt).toBeTruthy();
      expect(a.title.en).toBeTruthy();
    }
  });
});

describe("newlyDone", () => {
  it("só o que virou feito entre as duas fichas", () => {
    const antes = entry({ owned: [1, 2, 3, 4, 5, 6, 7, 8, 9] });
    const depois = entry({ owned: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { badges: [true, false, false, false, false, false, false, false] });
    expect(newlyDone(antes, depois).sort()).toEqual(["badge-1", "dex-10"]);
    expect(newlyDone(depois, depois)).toEqual([]);
  });
});
