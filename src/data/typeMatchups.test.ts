import { describe, expect, it } from "vitest";
import { attackMultiplier } from "./typeMatchups";

describe("attackMultiplier", () => {
  it("aplica vantagem simples", () => {
    expect(attackMultiplier("fire", ["grass"])).toBe(2);
  });

  it("aplica resistencia simples", () => {
    expect(attackMultiplier("fire", ["water"])).toBe(0.5);
  });

  it("aplica imunidade", () => {
    expect(attackMultiplier("electric", ["ground"])).toBe(0);
    expect(attackMultiplier("normal", ["ghost"])).toBe(0);
    expect(attackMultiplier("dragon", ["fairy"])).toBe(0);
  });

  it("multiplica os dois tipos do defensor", () => {
    // Gelo bate 2x em voador e 2x em dragao -> 4x (Dragonite)
    expect(attackMultiplier("ice", ["dragon", "flying"])).toBe(4);
    // Fogo: 2x em planta, 0.5x em dragao -> 1x
    expect(attackMultiplier("fire", ["grass", "dragon"])).toBe(1);
    // Um zero domina o produto
    expect(attackMultiplier("normal", ["ghost", "flying"])).toBe(0);
  });

  it("usa 1x para combinacoes neutras", () => {
    expect(attackMultiplier("normal", ["water"])).toBe(1);
  });

  it("defensor sem tipo resulta em 1x", () => {
    expect(attackMultiplier("fire", [])).toBe(1);
  });
});
