import { describe, expect, it } from "vitest";
import {
  REWIND_SETTINGS,
  rewindSeconds,
  screenshotFileName,
  stateThumbnailName,
  toDataUrl,
} from "./capture";

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

describe("stateThumbnailName", () => {
  it("e o nome do estado com .png", () => {
    expect(stateThumbnailName("Pokemon - Emerald.gba", 3)).toBe(
      "Pokemon - Emerald.ss3.png"
    );
  });

  it("acompanha o slot, para nao sobrar miniatura orfa", () => {
    const nomes = [1, 2, 3].map((s) => stateThumbnailName("j.gba", s));
    expect(new Set(nomes).size).toBe(3);
  });
});

describe("toDataUrl", () => {
  it("monta uma data URL de PNG", () => {
    // bytes magicos de PNG
    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(toDataUrl(png)).toBe("data:image/png;base64,iVBORw0KGgo=");
  });

  it("aceita o mime informado", () => {
    expect(toDataUrl(new Uint8Array([65]), "image/webp")).toBe(
      "data:image/webp;base64,QQ=="
    );
  });

  it("nao estoura a pilha com imagem de dezenas de kB", () => {
    // O caso que motivou os blocos: fromCharCode(...bytes) de uma vez quebra.
    const grande = new Uint8Array(200_000).fill(200);
    expect(() => toDataUrl(grande)).not.toThrow();
    expect(toDataUrl(grande).startsWith("data:image/png;base64,")).toBe(true);
  });

  it("bytes vazios ainda dao uma URL valida", () => {
    expect(toDataUrl(new Uint8Array(0))).toBe("data:image/png;base64,");
  });
});
