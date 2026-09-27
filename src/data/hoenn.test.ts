import { describe, expect, it } from "vitest";
import { HOENN_BADGES, HOENN_TOWNS, hoennLocationName } from "./hoenn";

describe("hoenn", () => {
  it("oito insígnias e dezesseis cidades", () => {
    expect(HOENN_BADGES).toHaveLength(8);
    expect(HOENN_TOWNS).toHaveLength(16);
  });

  /** Medido no save real: flags 0 e 1 ligadas, jogo salvo em Oldale. */
  it("as duas primeiras cidades são Littleroot e Oldale", () => {
    expect(HOENN_TOWNS.slice(0, 2)).toEqual(["Littleroot Town", "Oldale Town"]);
  });

  it("mapa 0.10 é Oldale, como no save real", () => {
    expect(hoennLocationName(0, 10)).toBe("Oldale Town");
  });

  it("rotas vêm depois das cidades", () => {
    expect(hoennLocationName(0, 16)).toBe("Route 101");
    expect(hoennLocationName(0, 49)).toBe("Route 134");
    expect(hoennLocationName(0, 50)).toBeUndefined();
  });

  it("dentro de prédio não tem nome conhecido", () => {
    expect(hoennLocationName(1, 0)).toBeUndefined();
  });

  it("toda cidade do grupo 0 também é cidade visitável", () => {
    for (let n = 0; n < 16; n++) expect(HOENN_TOWNS).toContain(hoennLocationName(0, n));
  });
});
