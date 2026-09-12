import { describe, expect, it } from "vitest";
import { REWIND_SETTINGS, rewindSeconds, screenshotFileName } from "./capture";

describe("screenshotFileName", () => {
  const when = new Date(2026, 8, 11, 22, 7, 3);

  it("junta o nome do jogo com a data, em PNG", () => {
    expect(screenshotFileName("Pokemon - Emerald.gba", when)).toBe(
      "Pokemon - Emerald-20260911-220703.png"
    );
  });

  it("preenche com zero para o nome ficar ordenavel", () => {
    const early = new Date(2026, 0, 2, 3, 4, 5);
    expect(screenshotFileName("jogo.gb", early)).toBe(
      "jogo-20260102-030405.png"
    );
  });

  it("duas capturas em segundos diferentes nao colidem", () => {
    const a = screenshotFileName("jogo.gba", new Date(2026, 8, 11, 22, 7, 3));
    const b = screenshotFileName("jogo.gba", new Date(2026, 8, 11, 22, 7, 4));
    expect(a).not.toBe(b);
  });

  it("ordem alfabetica dos nomes e a ordem cronologica", () => {
    const nomes = [
      screenshotFileName("j.gba", new Date(2026, 11, 1, 0, 0, 0)),
      screenshotFileName("j.gba", new Date(2026, 0, 1, 0, 0, 0)),
      screenshotFileName("j.gba", new Date(2026, 5, 1, 0, 0, 0)),
    ];
    expect([...nomes].sort()).toEqual([nomes[1], nomes[2], nomes[0]]);
  });
});

describe("rewindSeconds", () => {
  it("o padrao cobre cerca de dez segundos", () => {
    expect(rewindSeconds()).toBe(10);
  });

  it("intervalo maior estica o alcance", () => {
    expect(rewindSeconds(600, 2)).toBe(20);
  });

  it("nao divide por zero", () => {
    expect(rewindSeconds(600, 1, 0)).toBe(0);
    expect(rewindSeconds(600, 0)).toBe(0);
  });

  it("o padrao exportado e o que a conta usa", () => {
    expect(
      rewindSeconds(
        REWIND_SETTINGS.rewindBufferCapacity,
        REWIND_SETTINGS.rewindBufferInterval
      )
    ).toBe(rewindSeconds());
  });
});
