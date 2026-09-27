import { describe, it, expect } from "vitest";
import { matchup, nextGym, rankForGym, type BattleMember } from "./gymGuide";
import { EMERALD_GYMS, FRLG_GYMS } from "../data/gymLeaders";

const mudkip: BattleMember = {
  name: "MUDKIP",
  national: 258,
  level: 16,
  types: ["water"],
  moves: [
    { slug: "tackle", type: "normal", power: 35 },
    { slug: "water-gun", type: "water", power: 40 },
    { slug: "growl", type: "normal", power: null },
  ],
};
const torchic: BattleMember = {
  name: "TORCHIC",
  national: 255,
  level: 16,
  types: ["fire"],
  moves: [{ slug: "ember", type: "fire", power: 40 }],
};
const semGolpe: BattleMember = { name: "X", national: 1, level: 5, types: ["grass", "poison"], moves: [] };

describe("dados dos líderes", () => {
  it("oito ginásios em cada jogo, na ordem das insígnias", () => {
    expect(EMERALD_GYMS.map((g) => g.leader)).toEqual([
      "Roxanne", "Brawly", "Wattson", "Flannery", "Norman", "Winona", "Tate & Liza", "Juan",
    ]);
    expect(FRLG_GYMS.map((g) => g.leader)[0]).toBe("Brock");
    expect(FRLG_GYMS).toHaveLength(8);
  });

  it("Roxanne como a decompilação diz: dois Geodude nv 12 e Nosepass nv 15", () => {
    const r = EMERALD_GYMS[0].party;
    expect(r.map((m) => [m.species, m.level])).toEqual([["geodude", 12], ["geodude", 12], ["nosepass", 15]]);
    expect(r[0].types).toEqual(["rock", "ground"]);
  });
});

describe("matchup", () => {
  const geodude = EMERALD_GYMS[0].party[0];

  it("o melhor golpe seu e o pior golpe dele", () => {
    const m = matchup(mudkip, geodude);
    // Water Gun em Pedra/Terra: ×4
    expect(m.offense).toEqual({ mult: 4, move: "water-gun" });
    // Rock Throw/Rock Tomb em Água: ×1; Tackle ×1
    expect(m.defense.mult).toBe(1);
  });

  it("Fogo contra Pedra/Terra: fraco nos dois sentidos", () => {
    const m = matchup(torchic, geodude);
    expect(m.offense.mult).toBe(0.5);
    expect(m.defense).toMatchObject({ mult: 2 });
    expect(["rock-throw", "rock-tomb"]).toContain(m.defense.move);
  });

  it("sem golpe de dano, sem ofensiva", () => {
    expect(matchup(semGolpe, geodude).offense).toEqual({ mult: null });
  });
});

describe("rankForGym", () => {
  it("contra Roxanne, Mudkip na frente de Torchic", () => {
    const r = rankForGym([torchic, mudkip], EMERALD_GYMS[0]);
    expect(r.map((x) => x.member.name)).toEqual(["MUDKIP", "TORCHIC"]);
    expect(r[0].score).toBeGreaterThan(r[1].score);
  });
});

describe("nextGym", () => {
  it("o primeiro ginásio sem insígnia", () => {
    expect(nextGym([true, true, false, false, false, false, false, false])).toBe(2);
    expect(nextGym(Array(8).fill(true))).toBeNull();
    expect(nextGym(null)).toBe(0);
  });
});
