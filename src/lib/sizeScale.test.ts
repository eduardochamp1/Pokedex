import { describe, expect, it } from "vitest";
import { computeScale, HUMAN_HEIGHT_DM, MIN_SPRITE_PX } from "./sizeScale";

describe("computeScale", () => {
  it("com 1 pokemon menor que humano, humano domina", () => {
    const s = computeScale([{ name: "joltik", height: 1 }], { canvasHeight: 400 });
    expect(s.maxHeightDm).toBe(HUMAN_HEIGHT_DM);
    expect(s.pxPerDm).toBeCloseTo(400 / HUMAN_HEIGHT_DM, 2);
  });

  it("com pokemon maior que humano, ele dita a escala", () => {
    const s = computeScale([{ name: "wailord", height: 145 }], { canvasHeight: 400 });
    expect(s.maxHeightDm).toBe(145);
    expect(s.pxPerDm).toBeCloseTo(400 / 145, 4);
  });

  it("aplica piso minimo por sprite", () => {
    const s = computeScale(
      [
        { name: "wailord", height: 145 },
        { name: "joltik", height: 1 },
      ],
      { canvasHeight: 400 }
    );
    const jolt = s.sizes.find((x) => x.name === "joltik")!;
    expect(jolt.px).toBeGreaterThanOrEqual(MIN_SPRITE_PX);
  });

  it("multiplos pokemons produzem varias entradas", () => {
    const s = computeScale(
      [
        { name: "a", height: 5 },
        { name: "b", height: 10 },
        { name: "c", height: 20 },
      ],
      { canvasHeight: 400 }
    );
    expect(s.sizes).toHaveLength(3);
  });
});
