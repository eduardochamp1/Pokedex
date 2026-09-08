import { describe, expect, it } from "vitest";
import {
  SAVE_STATE_SLOTS,
  SUPPORTED_EXTENSIONS,
  consoleOf,
  isSupportedRom,
} from "./types";
import { KEY_BINDINGS, TOUCH_BUTTONS } from "./keyBindings";

describe("isSupportedRom", () => {
  it.each([".gb", ".gbc", ".gba"])("aceita %s", (ext) => {
    expect(isSupportedRom(`jogo${ext}`)).toBe(true);
  });

  it("ignora caixa da extensão", () => {
    expect(isSupportedRom("JOGO.GBA")).toBe(true);
    expect(isSupportedRom("Jogo.GbC")).toBe(true);
  });

  it("recusa o que o core não roda", () => {
    for (const name of ["jogo.nds", "jogo.zip", "jogo.sav", "jogo", "jogo.gb.txt"]) {
      expect(isSupportedRom(name), name).toBe(false);
    }
  });

  it("não confunde extensão no meio do nome", () => {
    expect(isSupportedRom("meu.gba.backup")).toBe(false);
  });
});

describe("consoleOf", () => {
  it("distingue os três consoles", () => {
    expect(consoleOf("x.gb")).toBe("Game Boy");
    expect(consoleOf("x.gbc")).toBe("Game Boy Color");
    expect(consoleOf("x.gba")).toBe("Game Boy Advance");
  });

  // .gbc termina em "c", nao em "b": a ordem dos testes importa para nao
  // classificar um GBC como GB.
  it("não classifica .gbc como Game Boy", () => {
    expect(consoleOf("jogo.gbc")).not.toBe("Game Boy");
  });

  it("degrada com elegância para extensão desconhecida", () => {
    expect(consoleOf("jogo.nds")).toBe("desconhecido");
  });
});

describe("mapa de teclas", () => {
  it("não tem tecla física repetida", () => {
    const keys = KEY_BINDINGS.map((b) => b.sdlKey);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  it("não tem botão do console repetido", () => {
    const buttons = KEY_BINDINGS.map((b) => b.button);
    expect(buttons.filter((b, i) => buttons.indexOf(b) !== i)).toEqual([]);
  });

  it("cobre os dez botões do GBA", () => {
    expect(new Set(KEY_BINDINGS.map((b) => b.button))).toEqual(
      new Set(["Up", "Down", "Left", "Right", "A", "B", "L", "R", "Start", "Select"])
    );
  });

  // A legenda da UI e o gamepad virtual leem da mesma fonte que o bindKey —
  // se divergirem, a tela mente sobre o que a tecla faz.
  it("o gamepad virtual cobre exatamente os mesmos botões", () => {
    expect(new Set(TOUCH_BUTTONS.map((b) => b.button))).toEqual(
      new Set(KEY_BINDINGS.map((b) => b.button))
    );
  });

  it("cada botão do gamepad tem uma área de grid própria", () => {
    const areas = TOUCH_BUTTONS.map((b) => b.area);
    expect(areas.filter((a, i) => areas.indexOf(a) !== i)).toEqual([]);
  });
});

describe("constantes", () => {
  it("as extensões suportadas começam com ponto", () => {
    for (const ext of SUPPORTED_EXTENSIONS) expect(ext.startsWith(".")).toBe(true);
  });

  it("os slots de save state são sequenciais a partir de 1", () => {
    expect([...SAVE_STATE_SLOTS]).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
