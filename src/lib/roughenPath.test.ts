import { describe, expect, it } from "vitest";
import { roughenPath } from "./roughenPath";

const QUADRADO = "M 10,10 L 90,10 L 90,90 L 10,90 Z";
const HOENN =
  "M 190,395 C 215,385 245,388 270,400 C 290,410 300,430 295,450 " +
  "C 285,470 265,480 240,478 C 215,475 195,462 185,442 C 180,425 182,408 190,395 Z " +
  "M 260,465 C 270,462 278,468 276,478 C 273,485 262,485 258,478 C 255,472 256,467 260,465 Z";

function pontos(d: string): { x: number; y: number }[] {
  return d
    .replace(/[MLZ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((par) => {
      const [x, y] = par.split(",").map(Number);
      return { x, y };
    });
}

describe("roughenPath", () => {
  it("é determinístico: a mesma semente devolve a mesma costa", () => {
    expect(roughenPath(HOENN, { seed: 3 })).toBe(roughenPath(HOENN, { seed: 3 }));
  });

  it("sementes diferentes desenham costas diferentes", () => {
    expect(roughenPath(HOENN, { seed: 3 })).not.toBe(roughenPath(HOENN, { seed: 4 }));
  });

  it("devolve um path fechado por subpath", () => {
    // Hoenn tem duas partes: a ilha principal e um ilhéu ao sul. As duas
    // precisam sobreviver ao recorte, cada uma fechada.
    const d = roughenPath(HOENN, { seed: 1 });
    expect(d.match(/M /g)).toHaveLength(2);
    expect(d.match(/Z/g)).toHaveLength(2);
  });

  it("mantém a silhueta: nenhum ponto foge além da amplitude pedida", () => {
    const d = roughenPath(QUADRADO, { seed: 2, amplitude: 3, step: 9 });
    for (const p of pontos(d)) {
      // O quadrado vai de 10 a 90; com amplitude 3 nada pode passar disso.
      expect(p.x).toBeGreaterThanOrEqual(10 - 3.01);
      expect(p.x).toBeLessThanOrEqual(90 + 3.01);
      expect(p.y).toBeGreaterThanOrEqual(10 - 3.01);
      expect(p.y).toBeLessThanOrEqual(90 + 3.01);
    }
  });

  it("amostra mais fino conforme o passo diminui", () => {
    const grosso = pontos(roughenPath(HOENN, { step: 20 })).length;
    const fino = pontos(roughenPath(HOENN, { step: 6 })).length;
    expect(fino).toBeGreaterThan(grosso);
  });

  it("devolve a entrada intacta quando não há o que amostrar", () => {
    expect(roughenPath("")).toBe("");
  });
});
