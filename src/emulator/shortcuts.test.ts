// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { isTypingTarget, shortcutFor } from "./shortcuts";

const press = (key: string, shiftKey = false) => ({ key, shiftKey });

describe("shortcutFor", () => {
  it("F1-F6 carregam o slot correspondente", () => {
    expect(shortcutFor(press("F1"))).toEqual({ kind: "load", slot: 1 });
    expect(shortcutFor(press("F6"))).toEqual({ kind: "load", slot: 6 });
  });

  it("Shift+F1-F6 gravam", () => {
    expect(shortcutFor(press("F1", true))).toEqual({ kind: "save", slot: 1 });
    expect(shortcutFor(press("F4", true))).toEqual({ kind: "save", slot: 4 });
  });

  it("F alem do sexto slot nao e atalho — a tela so tem seis", () => {
    expect(shortcutFor(press("F7"))).toBeNull();
    expect(shortcutFor(press("F12", true))).toBeNull();
  });

  it("espaco e turbo", () => {
    expect(shortcutFor(press(" "))).toEqual({ kind: "turbo" });
    expect(shortcutFor(press("Spacebar"))).toEqual({ kind: "turbo" });
  });

  it("tecla comum nao e atalho", () => {
    expect(shortcutFor(press("z"))).toBeNull();
    expect(shortcutFor(press("Enter"))).toBeNull();
    expect(shortcutFor(press("ArrowUp"))).toBeNull();
  });

  describe("teclas ja usadas pelo jogo", () => {
    it("quem remapeou uma acao para F3 recebe o jogo, nao o atalho", () => {
      expect(shortcutFor(press("F3"), new Set(["F3"]))).toBeNull();
      // as outras continuam valendo
      expect(shortcutFor(press("F2"), new Set(["F3"]))).toEqual({
        kind: "load",
        slot: 2,
      });
    });

    it("o mesmo vale para o espaco", () => {
      expect(shortcutFor(press(" "), new Set(["Space"]))).toBeNull();
      expect(shortcutFor(press(" "), new Set(["Z"]))).toEqual({ kind: "turbo" });
    });

    it("gravar tambem respeita o vinculo", () => {
      expect(shortcutFor(press("F5", true), new Set(["F5"]))).toBeNull();
    });
  });
});

/**
 * A regressao mais cara desta tela: o Espaco do turbo nunca chegava ao atalho.
 *
 * Para comecar a jogar a pessoa clica num botao, o foco fica nele, e enquanto
 * `BUTTON` estava nesta lista todo Espaco seguinte era descartado. Quem chama
 * da `preventDefault()`, entao o botao focado nao e acionado — e Enter continua
 * acionando botoes.
 */
describe("isTypingTarget", () => {
  const elemento = (tag: string) => document.createElement(tag);

  it("um botao focado nao rouba a tecla do jogo", () => {
    expect(isTypingTarget(elemento("button"))).toBe(false);
    expect(isTypingTarget(elemento("a"))).toBe(false);
  });

  it("campo de texto continua sendo campo de texto", () => {
    expect(isTypingTarget(elemento("input"))).toBe(true);
    expect(isTypingTarget(elemento("textarea"))).toBe(true);
    expect(isTypingTarget(elemento("select"))).toBe(true);
  });

  it("nao quebra com alvo que nao e elemento", () => {
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe("shortcutFor: rebobinar", () => {
  it("R rebobina, maiúsculo ou não", () => {
    expect(shortcutFor({ key: "r", shiftKey: false })).toEqual({ kind: "rewind" });
    expect(shortcutFor({ key: "R", shiftKey: true })).toEqual({ kind: "rewind" });
  });

  it("quem deu o R ao jogo fica com o jogo", () => {
    expect(shortcutFor({ key: "r", shiftKey: false }, new Set(["R"]))).toBeNull();
  });
});
