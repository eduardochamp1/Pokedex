import { describe, expect, it } from "vitest";
import { NATURES, natureOf, calcGen3Stat, expectedGen3Stats } from "./gen3Stats";

describe("naturezas", () => {
  it("são 25, na ordem do PV % 25", () => {
    expect(NATURES).toHaveLength(25);
    expect(NATURES[0].name).toBe("Hardy");
    expect(NATURES[3].name).toBe("Adamant");
    expect(NATURES[10].name).toBe("Timid");
    expect(NATURES[24].name).toBe("Quirky");
  });

  /** A tabela é uma grade 5×5: linha = o que sobe, coluna = o que desce. */
  it("a diagonal é neutra e o resto sobe um e desce outro", () => {
    for (let i = 0; i < 25; i++) {
      const n = NATURES[i];
      if (Math.floor(i / 5) === i % 5) {
        expect(n.up).toBeUndefined();
        expect(n.down).toBeUndefined();
      } else {
        expect(n.up).toBeDefined();
        expect(n.down).toBeDefined();
        expect(n.up).not.toBe(n.down);
      }
    }
  });

  it("Timid sobe velocidade e desce ataque; Modest sobe atq esp e desce ataque", () => {
    expect(natureOf(10)).toMatchObject({ up: "spe", down: "atk" });
    expect(natureOf(15)).toMatchObject({ name: "Modest", up: "spa", down: "atk" });
  });

  it("natureOf recusa fora de 0..24", () => {
    expect(natureOf(25)).toBeUndefined();
    expect(natureOf(-1)).toBeUndefined();
  });
});

/**
 * O Mudkip do save real, nv 8, Timid: os status que o jogo gravou fecharam com
 * a fórmula, os seis. É o caso que prova a fórmula e a leitura juntas.
 */
const MUDKIP_BASE = { hp: 50, atk: 70, def: 50, spa: 50, spd: 50, spe: 40 };
const MUDKIP_IVS = { hp: 24, atk: 1, def: 0, spe: 0, spa: 6, spd: 13 };
const MUDKIP_EVS = { hp: 2, atk: 3, def: 0, spe: 4, spa: 0, spd: 0 };

describe("fórmula de status de Gen 3", () => {
  it("fecha com o Mudkip do save real", () => {
    expect(expectedGen3Stats(MUDKIP_BASE, MUDKIP_IVS, MUDKIP_EVS, 8, 10)).toEqual({
      hp: 27,
      atk: 14,
      def: 13,
      spa: 13,
      spd: 14,
      spe: 12,
    });
  });

  /** Números de referência de Bulbapedia: Garchomp nv 78, Adamant. */
  it("fecha com o exemplo clássico do Garchomp", () => {
    const base = { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 };
    const ivs = { hp: 24, atk: 12, def: 30, spa: 16, spd: 23, spe: 5 };
    const evs = { hp: 74, atk: 190, def: 91, spa: 48, spd: 84, spe: 23 };
    expect(expectedGen3Stats(base, ivs, evs, 78, 3)).toEqual({
      hp: 289,
      atk: 278,
      def: 193,
      spa: 135,
      spd: 171,
      spe: 171,
    });
  });

  it("Shedinja tem sempre 1 de HP", () => {
    expect(calcGen3Stat("hp", 1, 31, 252, 100, 0, 292)).toBe(1);
  });
});
