import { describe, expect, it } from "vitest";
import {
  canvasSizeFor,
  describeScale,
  scaleFactor,
  type Size,
} from "./display";

const GBA: Size = { width: 240, height: 160 };
const GBC: Size = { width: 160, height: 144 };

describe("scaleFactor", () => {
  it("integer devolve o maior fator inteiro que cabe", () => {
    // 800/240 = 3,33 e 600/160 = 3,75 -> o limite e a largura
    expect(scaleFactor("integer", { width: 800, height: 600 }, GBA)).toBe(3);
  });

  it("integer respeita a dimensao mais apertada", () => {
    // largura daria 5x, mas a altura so comporta 2x
    expect(scaleFactor("integer", { width: 1200, height: 350 }, GBA)).toBe(2);
  });

  it("fit aceita fracao", () => {
    expect(scaleFactor("fit", { width: 800, height: 600 }, GBA)).toBeCloseTo(
      3.333,
      2
    );
  });

  it("fator fixo e teto, nao piso: 4x numa janela de 2x vira 2x", () => {
    expect(scaleFactor(4, { width: 560, height: 360 }, GBA)).toBe(2);
  });

  it("fator fixo menor que o disponivel e respeitado", () => {
    expect(scaleFactor(2, { width: 1600, height: 1200 }, GBA)).toBe(2);
  });

  it("nunca desce abaixo de 1, mesmo sem espaco", () => {
    expect(scaleFactor("integer", { width: 100, height: 80 }, GBA)).toBe(1);
    expect(scaleFactor(3, { width: 10, height: 10 }, GBA)).toBe(1);
  });

  it("container zerado (antes do layout) nao quebra", () => {
    expect(scaleFactor("integer", { width: 0, height: 0 }, GBA)).toBe(1);
    expect(scaleFactor("fit", { width: 0, height: 0 }, GBA)).toBe(1);
  });

  it("resolucao nativa invalida cai para 1", () => {
    expect(scaleFactor("integer", { width: 800, height: 600 }, { width: 0, height: 0 })).toBe(1);
  });

  it("funciona para a resolucao do GB/GBC", () => {
    // 480/160 = 3 e 432/144 = 3
    expect(scaleFactor("integer", { width: 480, height: 432 }, GBC)).toBe(3);
  });
});

describe("canvasSizeFor", () => {
  it("multiplica a resolucao nativa pelo fator", () => {
    expect(canvasSizeFor("integer", { width: 800, height: 600 }, GBA)).toEqual({
      width: 720,
      height: 480,
    });
  });

  it("no modo fit preenche a dimensao limitante", () => {
    const size = canvasSizeFor("fit", { width: 800, height: 600 }, GBA);
    expect(size.width).toBe(800);
    expect(size.height).toBe(533);
  });

  it("mantem a proporcao do console", () => {
    const size = canvasSizeFor(2, { width: 1600, height: 1200 }, GBC);
    expect(size.width / size.height).toBeCloseTo(160 / 144, 5);
  });
});

describe("describeScale", () => {
  it("mostra inteiro sem casas decimais", () => {
    expect(describeScale({ width: 720, height: 480 }, GBA)).toBe("3× · 720×480");
  });

  it("mostra fracao com duas casas", () => {
    expect(describeScale({ width: 800, height: 533 }, GBA)).toBe(
      "3.33× · 800×533"
    );
  });
});
