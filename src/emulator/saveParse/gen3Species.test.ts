import { describe, it, expect } from "vitest";
import {
  GEN3_SPECIES_TO_NATIONAL,
  nationalFromGen3Species,
} from "./gen3Species";

describe("tabela de espécies de Gen 3", () => {
  /** As mesmas três âncoras que o localizador do script usa na ROM. */
  it("as âncoras batem", () => {
    expect(nationalFromGen3Species(1)).toBe(1); // Bulbasaur
    expect(nationalFromGen3Species(251)).toBe(251); // Celebi
    expect(nationalFromGen3Species(411)).toBe(358); // Chimecho
  });

  it("cobre a dex de Gen 3 inteira", () => {
    expect(GEN3_SPECIES_TO_NATIONAL.length).toBe(386);
  });

  /**
   * Bijetiva: os 386 nacionais aparecem uma vez cada, sem duplicata e sem
   * buraco. É o que garante que o caminho save → dex nacional nunca devolve
   * dois pokémon para o mesmo registro, nem perde um.
   */
  it("é bijetiva sobre 1..386", () => {
    const nacionais = GEN3_SPECIES_TO_NATIONAL.map(([, n]) => n);
    const distintos = new Set(nacionais);
    expect(distintos.size).toBe(386);
    const faltando = [];
    for (let n = 1; n <= 386; n++) if (!distintos.has(n)) faltando.push(n);
    expect(faltando).toEqual([]);
  });

  it("os índices internos também são distintos", () => {
    const indices = GEN3_SPECIES_TO_NATIONAL.map(([i]) => i);
    expect(new Set(indices).size).toBe(indices.length);
  });

  /**
   * Os 25 sentinelas mapeiam para 387..411, fora da dex de Gen 3, e a tabela de
   * nomes guarda "?" neles — não são espécies e não podem estar aqui.
   */
  it("não traz os sentinelas 252–276", () => {
    const sentinelas = GEN3_SPECIES_TO_NATIONAL.filter(
      ([i]) => i >= 252 && i <= 276
    );
    expect(sentinelas).toEqual([]);
  });

  /**
   * A armadilha que motivou ler a tabela da ROM: `nacional = índice − 25`
   * parece funcionar no começo e desanda a partir do índice 301.
   */
  it("prova que a fórmula ingênua estaria errada", () => {
    const errados = GEN3_SPECIES_TO_NATIONAL.filter(
      ([idx, nacional]) => idx > 251 && nacional !== idx - 25
    );
    expect(errados.length).toBeGreaterThan(100);
    // Nincada, o primeiro caso citado no plano.
    expect(nationalFromGen3Species(301)).toBe(290);
  });

  it("devolve undefined para índice que não existe", () => {
    expect(nationalFromGen3Species(0)).toBeUndefined();
    expect(nationalFromGen3Species(252)).toBeUndefined();
    expect(nationalFromGen3Species(9999)).toBeUndefined();
  });
});
