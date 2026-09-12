import { describe, expect, it } from "vitest";
import { shortcutFor } from "./shortcuts";

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
