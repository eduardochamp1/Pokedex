import { describe, expect, it } from "vitest";
import { SONS } from "./sfx";

describe("bipes do aparelho", () => {
  it("cada transição tem o seu som, curto", () => {
    for (const [nome, { notas, passo }] of Object.entries(SONS)) {
      expect(notas.length, nome).toBeGreaterThan(0);
      expect(notas.length * passo, nome).toBeLessThan(0.25);
    }
  });

  it("abrir sobe e voltar desce", () => {
    const sobe = (n: number[]) => n.every((hz, i) => i === 0 || hz > n[i - 1]);
    expect(sobe(SONS.abrir.notas)).toBe(true);
    expect(sobe(SONS.aba.notas)).toBe(true);
    expect(sobe([...SONS.voltar.notas].reverse())).toBe(true);
  });
});
