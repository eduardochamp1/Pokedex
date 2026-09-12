import { describe, expect, it } from "vitest";
import {
  DEFAULT_BINDINGS,
  diffFromDefaults,
  mergeBindings,
  rebind,
} from "./keyBindings";
import { labelForSdlKey, sdlKeyFromCode } from "./keyNames";

const keyOf = (bindings: typeof DEFAULT_BINDINGS, button: string) =>
  bindings.find((b) => b.button === button)?.sdlKey;

describe("sdlKeyFromCode", () => {
  it("letras e digitos viram o nome SDL", () => {
    expect(sdlKeyFromCode("KeyZ")).toBe("Z");
    expect(sdlKeyFromCode("KeyA")).toBe("A");
    expect(sdlKeyFromCode("Digit7")).toBe("7");
  });

  it("as teclas do mapa padrao fazem o caminho de volta", () => {
    // Se esta correspondencia quebrar, remapear para a tecla que ja era o
    // padrao gravaria um nome que o core nao reconhece.
    expect(sdlKeyFromCode("ArrowUp")).toBe("Up");
    expect(sdlKeyFromCode("ArrowDown")).toBe("Down");
    expect(sdlKeyFromCode("ArrowLeft")).toBe("Left");
    expect(sdlKeyFromCode("ArrowRight")).toBe("Right");
    expect(sdlKeyFromCode("Enter")).toBe("Return");
    expect(sdlKeyFromCode("Backspace")).toBe("Backspace");
  });

  it("numerico e funcao", () => {
    expect(sdlKeyFromCode("Numpad4")).toBe("Keypad 4");
    expect(sdlKeyFromCode("NumpadEnter")).toBe("Keypad Enter");
    expect(sdlKeyFromCode("F5")).toBe("F5");
    expect(sdlKeyFromCode("F12")).toBe("F12");
  });

  it("modificadores distinguem lado", () => {
    expect(sdlKeyFromCode("ShiftLeft")).toBe("Left Shift");
    expect(sdlKeyFromCode("ShiftRight")).toBe("Right Shift");
  });

  it("recusa o que nao serve de tecla de jogo", () => {
    expect(sdlKeyFromCode("MetaLeft")).toBeNull();
    expect(sdlKeyFromCode("AudioVolumeUp")).toBeNull();
    expect(sdlKeyFromCode("F13")).toBeNull();
  });
});

describe("labelForSdlKey", () => {
  it("encurta o que e longo e deixa o resto como esta", () => {
    expect(labelForSdlKey("Up")).toBe("↑");
    expect(labelForSdlKey("Return")).toBe("Enter");
    expect(labelForSdlKey("Z")).toBe("Z");
  });
});

describe("mergeBindings", () => {
  it("sem nada gravado, devolve o padrao", () => {
    expect(mergeBindings(undefined)).toEqual(DEFAULT_BINDINGS);
  });

  it("aplica so o que foi remapeado", () => {
    const merged = mergeBindings({ A: "K" });
    expect(keyOf(merged, "A")).toBe("K");
    expect(keyOf(merged, "B")).toBe("X");
  });

  it("a legenda acompanha a tecla nova", () => {
    const merged = mergeBindings({ Start: "Space" });
    expect(merged.find((b) => b.button === "Start")?.label).toBe("Espaço");
  });

  it("nao muta o padrao", () => {
    mergeBindings({ A: "K" });
    expect(keyOf(DEFAULT_BINDINGS, "A")).toBe("Z");
  });
});

describe("diffFromDefaults", () => {
  it("grava so a diferenca, para um default novo alcancar quem nao remapeou", () => {
    const changed = rebind(DEFAULT_BINDINGS, "A", "K");
    expect(diffFromDefaults(changed)).toEqual({ A: "K" });
  });

  it("mapa intocado nao grava nada", () => {
    expect(diffFromDefaults(DEFAULT_BINDINGS)).toEqual({});
  });

  it("ida e volta pelo localStorage preserva o mapa", () => {
    const changed = rebind(DEFAULT_BINDINGS, "Start", "Space");
    expect(mergeBindings(diffFromDefaults(changed))).toEqual(changed);
  });
});

describe("rebind", () => {
  it("troca a tecla de uma acao", () => {
    const next = rebind(DEFAULT_BINDINGS, "A", "K");
    expect(keyOf(next, "A")).toBe("K");
  });

  it("tecla ja usada faz as duas acoes trocarem", () => {
    // "X" era do B; dar "X" para o A tem que devolver "Z" (do A) para o B,
    // senao o B ficaria sem tecla nenhuma.
    const next = rebind(DEFAULT_BINDINGS, "A", "X");
    expect(keyOf(next, "A")).toBe("X");
    expect(keyOf(next, "B")).toBe("Z");
  });

  it("nunca deixa duas acoes na mesma tecla", () => {
    const next = rebind(DEFAULT_BINDINGS, "Up", "Z");
    const keys = next.map((b) => b.sdlKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("nunca deixa uma acao sem tecla", () => {
    const next = rebind(DEFAULT_BINDINGS, "Left", "Return");
    expect(next.every((b) => b.sdlKey.length > 0)).toBe(true);
    expect(next).toHaveLength(DEFAULT_BINDINGS.length);
  });

  it("remapear para a mesma tecla nao muda nada", () => {
    expect(rebind(DEFAULT_BINDINGS, "A", "Z")).toBe(DEFAULT_BINDINGS);
  });

  it("acao inexistente nao altera o mapa", () => {
    expect(rebind(DEFAULT_BINDINGS, "Turbo", "K")).toBe(DEFAULT_BINDINGS);
  });

  it("a legenda da acao que cedeu a tecla tambem acompanha", () => {
    const next = rebind(DEFAULT_BINDINGS, "A", "Return");
    expect(next.find((b) => b.button === "Start")?.label).toBe("Z");
  });
});
