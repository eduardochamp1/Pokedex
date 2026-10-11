import { describe, it, expect } from "vitest";
import { TIMELINE_GAMES } from "../data/gameTimeline";
import { VERSION_GROUPS } from "../data/versionGroups";
import { REGIONS } from "../data/regions";
import { byYear, filterGames } from "./gameTimeline";

describe("os dados da linha do tempo", () => {
  it("em ordem de ano, e cada jogo aponta para um grupo de versão que existe", () => {
    const anos = TIMELINE_GAMES.map((g) => g.year);
    expect([...anos].sort((a, b) => a - b)).toEqual(anos);
    const grupos = new Set(VERSION_GROUPS.map((v) => v.id));
    for (const g of TIMELINE_GAMES) expect(grupos.has(g.versionGroup), g.title).toBe(true);
  });

  it("toda região existe no site, fora Hisui", () => {
    const regioes = new Set(REGIONS.map((r) => r.id));
    for (const g of TIMELINE_GAMES) if (g.region !== "hisui") expect(regioes.has(g.region), g.title).toBe(true);
  });

});

describe("byYear / filterGames", () => {
  it("agrupa por ano, em ordem", () => {
    const anos = byYear(TIMELINE_GAMES);
    expect(anos[0].year).toBe(1996);
    expect(anos[0].games.map((g) => g.title)).toEqual(["Red & Green", "Blue"]);
    expect(anos.find((a) => a.year === 2004)?.games.map((g) => g.title)).toEqual(["FireRed & LeafGreen", "Emerald"]);
  });

  it("filtra por remake e por geração", () => {
    expect(filterGames(TIMELINE_GAMES, { remakes: "only", generation: "all" }).map((g) => g.title)).toContain("FireRed & LeafGreen");
    expect(filterGames(TIMELINE_GAMES, { remakes: "none", generation: 3 }).map((g) => g.title)).toEqual(["Ruby & Sapphire", "Emerald"]);
  });
});
