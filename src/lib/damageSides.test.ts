import { describe, it, expect } from "vitest";
import { baseStatsOf, gen3Learnset, genericStats } from "./damageSides";

const stat = (name: string, base_stat: number) => ({ base_stat, effort: 0, stat: { name, url: "" } });
const vg = (name: string) => ({ level_learned_at: 1, move_learn_method: { name: "level-up", url: "" }, version_group: { name, url: "" } });

describe("baseStatsOf", () => {
  it("do formato da PokéAPI para o de gen3Stats", () => {
    const p = { stats: [stat("hp", 40), stat("attack", 45), stat("defense", 35), stat("special-attack", 65), stat("special-defense", 55), stat("speed", 70)] };
    expect(baseStatsOf(p)).toEqual({ hp: 40, atk: 45, def: 35, spa: 65, spd: 55, spe: 70 });
    expect(baseStatsOf({ stats: [stat("hp", 1)] })).toBeUndefined();
  });
});

describe("genericStats", () => {
  it("IV 31, EV 0, natureza neutra", () => {
    // Treecko nv 100: HP 221, Vel ⌊(140+31)·1⌋+5 = 176
    const s = genericStats({ hp: 40, atk: 45, def: 35, spa: 65, spd: 55, spe: 70 }, 100);
    expect(s.hp).toBe(221);
    expect(s.maxHp).toBe(221);
    expect(s.spe).toBe(176);
  });
});

describe("gen3Learnset", () => {
  it("só golpes aprendidos em algum jogo de Gen 3, sem repetir, em ordem", () => {
    const p = {
      moves: [
        { move: { name: "tackle", url: "" }, version_group_details: [vg("red-blue"), vg("emerald")] },
        { move: { name: "moonblast", url: "" }, version_group_details: [vg("x-y")] },
        { move: { name: "absorb", url: "" }, version_group_details: [vg("firered-leafgreen")] },
      ],
    };
    expect(gen3Learnset(p)).toEqual(["absorb", "tackle"]);
  });
});
