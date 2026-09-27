import { describe, it, expect } from "vitest";
import { compareEntries } from "./compareSaves";
import type { TrainerEntry } from "./trainerLog";

function entry(over: Partial<TrainerEntry>, trainer: Partial<TrainerEntry["trainer"]> = {}): TrainerEntry {
  return {
    rom: "e.gba",
    game: "emerald",
    updatedAt: 0,
    playerName: "ZE",
    trainer: {
      gender: "male",
      trainerId: 1,
      secretId: 2,
      playTime: { hours: 1, minutes: 0, seconds: 0 },
      money: 3000,
      badges: Array(8).fill(false),
      visitedTowns: [0],
      location: null,
      ...trainer,
    },
    party: [],
    boxes: [],
    owned: [],
    seen: [],
    last: { at: 0, playSeconds: 0, owned: [], seenCount: 0, badges: [], towns: [], party: [] },
    events: [],
    ...over,
  };
}

describe("compareEntries", () => {
  const a = entry({ owned: [1, 4, 7, 25], seen: [1, 4, 7, 25, 16] }, { money: 5000, badges: [true, true, false, false, false, false, false, false] });
  const b = entry(
    { game: "frlg", owned: [1, 25, 133], seen: [1, 25, 133], boxes: [{ name: "BOX1", pokemon: [{ national: 133, nickname: "EEVEE" }] }] },
    { money: 9000, playTime: { hours: 3, minutes: 0, seconds: 0 }, badges: [true, false, false, false, false, false, false, false] }
  );
  const c = compareEntries(a, b);

  it("a diferença de dex, nos dois sentidos", () => {
    expect(c.onlyA).toEqual([4, 7]);
    expect(c.onlyB).toEqual([133]);
    expect(c.both).toEqual([1, 25]);
  });

  it("linhas com quem está à frente", () => {
    const linha = (k: string) => c.rows.find((r) => r.key === k);
    expect(linha("owned")).toMatchObject({ a: 4, b: 3, ahead: "a" });
    expect(linha("seen")).toMatchObject({ a: 5, b: 3, ahead: "a" });
    expect(linha("badges")).toMatchObject({ a: 2, b: 1, ahead: "a" });
    expect(linha("money")).toMatchObject({ a: 5000, b: 9000, ahead: "b" });
    expect(linha("time")).toMatchObject({ a: 3600, b: 10800, ahead: "b" });
    expect(linha("pc")).toMatchObject({ a: 0, b: 1, ahead: "b" });
  });

  it("empate não tem ninguém à frente, e o que um lado não registra fica null", () => {
    const rs = entry({ game: "rs" }, { money: null, badges: null });
    const r = compareEntries(rs, entry({}));
    expect(r.rows.find((x) => x.key === "money")).toMatchObject({ a: null, b: 3000, ahead: null });
    expect(r.rows.find((x) => x.key === "badges")).toMatchObject({ a: null, b: 0, ahead: null });
    expect(r.rows.find((x) => x.key === "owned")).toMatchObject({ a: 0, b: 0, ahead: null });
  });
});
