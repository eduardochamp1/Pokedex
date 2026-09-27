import { describe, expect, it } from "vitest";
import { ballMultiplier, catchChance, captureOdds, BALLS } from "./capture";

describe("captureOdds (o 'a' da fórmula, em inteiros como o jogo)", () => {
  /** 45 × 10/10 × (3M − 2M) / 3M = 15, com M = HP cheio. */
  it("taxa 45, HP cheio, Poké Ball", () => {
    expect(captureOdds({ catchRate: 45, ball: 10, maxHp: 100, hp: 100, status: "none" })).toBe(15);
  });

  it("status multiplica: sono ×2, paralisia ×1,5", () => {
    const base = { catchRate: 45, ball: 10, maxHp: 100, hp: 100 };
    expect(captureOdds({ ...base, status: "sleep" })).toBe(30);
    expect(captureOdds({ ...base, status: "paralysis" })).toBe(22); // 15 × 15 / 10 = 22,5 → 22
  });
});

describe("catchChance", () => {
  /**
   * Contas à mão, seguindo a decompilação: 16711680/15 = 1114112, raiz
   * inteira 1055, raiz 32, 1048560/32 = 32767; (32767/65536)^4 ≈ 6,25%.
   */
  it("taxa 45, HP cheio, Poké Ball ≈ 6,25%", () => {
    const p = catchChance({ catchRate: 45, ball: 10, maxHp: 100, hp: 100, status: "none" });
    expect(p).toBeCloseTo(0.0625, 3);
  });

  /** a = 85; 196608 → 443 → 21; 1048560/21 = 49931; (49931/65536)^4 ≈ 33,7%. */
  it("taxa 255, HP cheio, Poké Ball ≈ 33,7%", () => {
    const p = catchChance({ catchRate: 255, ball: 10, maxHp: 100, hp: 100, status: "none" });
    expect(p).toBeCloseTo(0.3369, 3);
  });

  /** Rayquaza (taxa 3), Ultra Ball, 1 PS, dormindo: a = 5 × 2 = 10 → ≈ 4,4%. */
  it("lendário de taxa 3 com Ultra Ball, 1 PS e sono ≈ 4,4%", () => {
    const p = catchChance({ catchRate: 3, ball: 20, maxHp: 150, hp: 1, status: "sleep" });
    expect(p).toBeCloseTo(0.0437, 3);
  });

  it("a acima de 254 captura sempre", () => {
    expect(catchChance({ catchRate: 255, ball: 20, maxHp: 100, hp: 1, status: "sleep" })).toBe(1);
  });

  it("Master Ball é sempre", () => {
    expect(catchChance({ catchRate: 3, ball: "master", maxHp: 100, hp: 100, status: "none" })).toBe(1);
  });

  it("menos HP, mais chance", () => {
    const cheio = catchChance({ catchRate: 45, ball: 10, maxHp: 100, hp: 100, status: "none" });
    const metade = catchChance({ catchRate: 45, ball: 10, maxHp: 100, hp: 50, status: "none" });
    expect(metade).toBeGreaterThan(cheio);
  });
});

describe("ballMultiplier (×10, como no jogo)", () => {
  const ctx = { types: ["normal"], level: 10, owned: false, turn: 1 };

  it("as de tabela", () => {
    expect(ballMultiplier("poke", ctx)).toBe(10);
    expect(ballMultiplier("great", ctx)).toBe(15);
    expect(ballMultiplier("ultra", ctx)).toBe(20);
  });

  it("Net Ball só em água e inseto", () => {
    expect(ballMultiplier("net", ctx)).toBe(10);
    expect(ballMultiplier("net", { ...ctx, types: ["water", "ground"] })).toBe(30);
    expect(ballMultiplier("net", { ...ctx, types: ["bug"] })).toBe(30);
  });

  it("Nest Ball: 40 − nível abaixo do 40, nunca menos que 10", () => {
    expect(ballMultiplier("nest", { ...ctx, level: 5 })).toBe(35);
    expect(ballMultiplier("nest", { ...ctx, level: 35 })).toBe(10);
    expect(ballMultiplier("nest", { ...ctx, level: 50 })).toBe(10);
  });

  it("Repeat Ball: ×3 se já capturou a espécie", () => {
    expect(ballMultiplier("repeat", ctx)).toBe(10);
    expect(ballMultiplier("repeat", { ...ctx, owned: true })).toBe(30);
  });

  it("Timer Ball: turno + 10, até 40", () => {
    expect(ballMultiplier("timer", { ...ctx, turn: 1 })).toBe(11);
    expect(ballMultiplier("timer", { ...ctx, turn: 30 })).toBe(40);
    expect(ballMultiplier("timer", { ...ctx, turn: 31 })).toBe(40);
  });

  it("Master devolve 'master'", () => {
    expect(ballMultiplier("master", ctx)).toBe("master");
  });

  it("toda bola da lista tem rótulo", () => {
    expect(BALLS.every((b) => b.label.length > 0)).toBe(true);
  });
});
