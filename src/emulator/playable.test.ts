import { describe, it, expect } from "vitest";
import {
  KNOWN_VERSION_GROUP_IDS,
  PLAYABLE_VERSION_GROUPS,
  isPlayable,
  isPlayableGeneration,
} from "./playable";

describe("PLAYABLE_VERSION_GROUPS", () => {
  /**
   * Um id escrito errado aqui nunca casaria com nada e o link simplesmente não
   * apareceria — falha silenciosa, do tipo que ninguém nota. Daí o teste.
   */
  it("todo id existe em VERSION_GROUPS", () => {
    const fantasmas = PLAYABLE_VERSION_GROUPS.filter(
      (id) => !KNOWN_VERSION_GROUP_IDS.has(id)
    );
    expect(fantasmas).toEqual([]);
  });
});

describe("isPlayable", () => {
  it("aceita os três consoles que o core roda", () => {
    expect(isPlayable("red-blue")).toBe(true);
    expect(isPlayable("crystal")).toBe(true);
    expect(isPlayable("emerald")).toBe(true);
    expect(isPlayable("firered-leafgreen")).toBe(true);
  });

  it("recusa o que veio de DS em diante", () => {
    expect(isPlayable("diamond-pearl")).toBe(false);
    expect(isPlayable("sword-shield")).toBe(false);
    expect(isPlayable("scarlet-violet")).toBe(false);
  });

  /**
   * A armadilha: Colosseum e XD são de Geração III e **não** rodam aqui —
   * saíram no GameCube. Por isso a lista é de grupos de versão e não de
   * `geracao <= 3`.
   */
  it("recusa os de GameCube, mesmo sendo de Geração III", () => {
    expect(isPlayable("colosseum")).toBe(false);
    expect(isPlayable("xd")).toBe(false);
  });

  it("não estoura com indefinido ou id inventado", () => {
    expect(isPlayable(undefined)).toBe(false);
    expect(isPlayable("nao-existe")).toBe(false);
  });
});

describe("isPlayableGeneration", () => {
  it("vale para I, II e III", () => {
    expect(isPlayableGeneration(1)).toBe(true);
    expect(isPlayableGeneration(3)).toBe(true);
  });

  it("não vale da IV em diante nem para número inválido", () => {
    expect(isPlayableGeneration(4)).toBe(false);
    expect(isPlayableGeneration(9)).toBe(false);
    expect(isPlayableGeneration(0)).toBe(false);
  });
});
