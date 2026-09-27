import { describe, expect, it } from "vitest";
import { encounterVersions, encountersFor, areaLabel, methodLabel, type EncounterArea } from "./encounters";
import { versionLabel, versionRegion, versionOrder } from "../data/versions";

const det = (method: string, min: number, max: number, chance: number, conds: string[] = []) => ({
  min_level: min,
  max_level: max,
  chance,
  method: { name: method, url: "" },
  condition_values: conds.map((name) => ({ name, url: "" })),
});

/**
 * Recorte real de /pokemon/263/encounters (Zigzagoon). Na Rota 101, Emerald
 * dá 10% — em Ruby/Sapphire eram 45%: Emerald trocou o Zigzagoon pelo
 * Poochyena ali. As chances de um mesmo método somam o `max_chance`.
 */
const ZIGZAGOON: EncounterArea[] = [
  {
    location_area: { name: "hoenn-route-101-area", url: "" },
    version_details: [
      {
        version: { name: "ruby", url: "" },
        max_chance: 45,
        encounter_details: [det("walk", 2, 2, 20), det("walk", 3, 3, 10), det("walk", 3, 3, 10), det("walk", 3, 3, 5)],
      },
      {
        version: { name: "emerald", url: "" },
        max_chance: 10,
        encounter_details: [det("walk", 2, 2, 4), det("walk", 2, 2, 4), det("walk", 3, 3, 1), det("walk", 3, 3, 1)],
      },
    ],
  },
  {
    location_area: { name: "hoenn-route-118-area", url: "" },
    version_details: [
      {
        version: { name: "emerald", url: "" },
        max_chance: 30,
        encounter_details: [det("walk", 24, 24, 20), det("walk", 26, 26, 10)],
      },
    ],
  },
  {
    location_area: { name: "sinnoh-route-202-area", url: "" },
    version_details: [
      {
        version: { name: "platinum", url: "" },
        max_chance: 10,
        encounter_details: [det("walk", 3, 3, 10, ["swarm-yes"]), det("walk", 3, 3, 5, ["radio-hoenn"])],
      },
    ],
  },
];

describe("encounterVersions", () => {
  it("lista os jogos em ordem cronológica, sem repetir", () => {
    expect(encounterVersions(ZIGZAGOON)).toEqual(["ruby", "emerald", "platinum"]);
  });
});

describe("encountersFor", () => {
  it("soma as chances por área e método, e junta a faixa de nível", () => {
    expect(encountersFor(ZIGZAGOON, "emerald")).toEqual([
      { area: "Route 101", method: "walk", minLevel: 2, maxLevel: 3, chance: 10, conditions: [] },
      { area: "Route 118", method: "walk", minLevel: 24, maxLevel: 26, chance: 30, conditions: [] },
    ]);
  });

  it("Ruby tem os 45% originais", () => {
    expect(encountersFor(ZIGZAGOON, "ruby")[0].chance).toBe(45);
  });

  /** Condição diferente é encontro diferente: enxame não é o mesmo que rádio. */
  it("separa por condição", () => {
    const rows = encountersFor(ZIGZAGOON, "platinum");
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.conditions)).toEqual([["swarm-yes"], ["radio-hoenn"]]);
  });

  it("jogo sem encontro dá lista vazia", () => {
    expect(encountersFor(ZIGZAGOON, "red")).toEqual([]);
  });
});

describe("rótulos", () => {
  it("área sem prefixo de região e sem -area", () => {
    expect(areaLabel("hoenn-route-101-area")).toBe("Route 101");
    expect(areaLabel("petalburg-woods-area")).toBe("Petalburg Woods");
    expect(areaLabel("sprout-tower-2f")).toBe("Sprout Tower 2F");
    expect(areaLabel("kalos-route-2-area")).toBe("Route 2");
  });

  it("método em português, desconhecido vira título", () => {
    expect(methodLabel("walk")).toBe("Andando na grama");
    expect(methodLabel("super-rod")).toBe("Super Rod");
    expect(methodLabel("metodo-novo")).toBe("Metodo Novo");
  });

  it("versões: rótulo, região e ordem", () => {
    expect(versionLabel("emerald")).toBe("Emerald");
    expect(versionLabel("jogo-futuro")).toBe("Jogo Futuro");
    expect(versionRegion("emerald")).toBe("hoenn");
    expect(versionOrder("ruby")).toBeLessThan(versionOrder("sapphire"));
    expect(versionOrder("sapphire")).toBeLessThan(versionOrder("emerald"));
    expect(versionOrder("emerald")).toBeLessThan(versionOrder("firered"));
  });
});
