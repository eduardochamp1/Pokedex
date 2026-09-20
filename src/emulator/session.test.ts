import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  forgetLastRom,
  getLastRom,
  getVolume,
  rememberLastRom,
  rememberVolume,
} from "./session";

/** localStorage de mentira: o ambiente do vitest roda sem DOM. */
function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
    raw: map,
  };
}

let storage: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  storage = fakeStorage();
  vi.stubGlobal("localStorage", storage);
});

describe("ultima ROM", () => {
  it("sem nada gravado, nao ha o que retomar", () => {
    expect(getLastRom()).toBeUndefined();
  });

  it("lembra e devolve", () => {
    rememberLastRom("Pokemon - Emerald.gba");
    expect(getLastRom()).toBe("Pokemon - Emerald.gba");
  });

  it("esquecer apaga — e o que 'Fechar jogo' usa para nao trazer de volta", () => {
    rememberLastRom("Emerald.gba");
    forgetLastRom();
    expect(getLastRom()).toBeUndefined();
  });

  it("valor invalido gravado por outra versao nao vira estado quebrado", () => {
    storage.raw.set("pokedex:emulator:last-rom", "123");
    expect(getLastRom()).toBeUndefined();
    storage.raw.set("pokedex:emulator:last-rom", '""');
    expect(getLastRom()).toBeUndefined();
  });

  it("JSON corrompido cai no padrao em vez de lancar", () => {
    storage.raw.set("pokedex:emulator:last-rom", "{quebrado");
    expect(() => getLastRom()).not.toThrow();
    expect(getLastRom()).toBeUndefined();
  });
});

describe("volume", () => {
  it("padrao e 100", () => {
    expect(getVolume()).toBe(100);
  });

  it("ida e volta", () => {
    rememberVolume(35);
    expect(getVolume()).toBe(35);
  });

  it("aceita os extremos", () => {
    rememberVolume(0);
    expect(getVolume()).toBe(0);
    rememberVolume(100);
    expect(getVolume()).toBe(100);
  });

  it("fora da faixa cai no padrao", () => {
    storage.raw.set("pokedex:emulator:volume", "150");
    expect(getVolume()).toBe(100);
    storage.raw.set("pokedex:emulator:volume", "-5");
    expect(getVolume()).toBe(100);
  });
});

/**
 * A sessao nao guarda mais velocidade.
 *
 * A regua de velocidade saiu da tela: o modelo agora e o do mGBA de mesa —
 * velocidade normal e turbo enquanto a tecla esta segurada, sem nada para
 * lembrar entre visitas.
 */
describe("velocidade", () => {
  it("nao ha preferencia de velocidade para guardar", () => {
    expect(storage.raw.has("pokedex:emulator:fast-forward")).toBe(false);
  });
});

describe("sem localStorage", () => {
  it("nao derruba o emulador", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
      removeItem: () => {
        throw new Error("bloqueado");
      },
    });
    expect(() => rememberVolume(50)).not.toThrow();
    expect(getVolume()).toBe(100);
    expect(getLastRom()).toBeUndefined();
    expect(() => forgetLastRom()).not.toThrow();
  });
});
