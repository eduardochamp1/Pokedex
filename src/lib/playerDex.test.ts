import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  recordPlayerDex,
  latestPlayerDex,
  reloadPlayerDex,
  dexMarkOf,
  nationalsFor,
  parseDexFilter,
  type PlayerDexEntry,
} from "./playerDex";

const KEY = "pokedex:player-dex";

// Stub minimo pra localStorage no ambiente node.
const memory: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(memory)) delete memory[k];
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (k in memory ? memory[k] : null),
    setItem: (k: string, v: string) => {
      memory[k] = v;
    },
    removeItem: (k: string) => {
      delete memory[k];
    },
  } as unknown as Storage);
  reloadPlayerDex();
});

const EMERALD = { seen: [252, 258, 261, 263, 265, 278], owned: [258] };

describe("playerDex — store", () => {
  it("começa vazio", () => {
    expect(latestPlayerDex()).toBeNull();
  });

  it("grava e devolve a entrada", () => {
    recordPlayerDex("Pokemon - Emerald.gba", "ZE", EMERALD, 1000);
    expect(latestPlayerDex()).toEqual({
      rom: "Pokemon - Emerald.gba",
      playerName: "ZE",
      seen: EMERALD.seen,
      owned: EMERALD.owned,
      updatedAt: 1000,
    });
  });

  it("sobrevive a recarregar a página", () => {
    recordPlayerDex("Pokemon - Emerald.gba", "ZE", EMERALD, 1000);
    reloadPlayerDex();
    expect(latestPlayerDex()?.owned).toEqual([258]);
  });

  it("a gravação mais recente vence entre jogos", () => {
    recordPlayerDex("Emerald.gba", "ZE", EMERALD, 1000);
    recordPlayerDex("Ruby.gba", "ANA", { seen: [1], owned: [1] }, 2000);
    expect(latestPlayerDex()?.rom).toBe("Ruby.gba");
    recordPlayerDex("Emerald.gba", "ZE", EMERALD, 3000);
    expect(latestPlayerDex()?.rom).toBe("Emerald.gba");
  });

  it("regravar a mesma ROM substitui, não acumula", () => {
    recordPlayerDex("Emerald.gba", "ZE", EMERALD, 1000);
    recordPlayerDex("Emerald.gba", "ZE", { seen: [1, 258], owned: [1, 258] }, 2000);
    reloadPlayerDex();
    expect(latestPlayerDex()?.seen).toEqual([1, 258]);
    expect(Object.keys(JSON.parse(memory[KEY]))).toEqual(["Emerald.gba"]);
  });

  it("descarta o que foi gravado com forma errada", () => {
    memory[KEY] = JSON.stringify({
      "a.gba": { rom: "a.gba", playerName: "X", seen: "nada", owned: [], updatedAt: 5 },
      "b.gba": { rom: "b.gba", playerName: "Y", seen: [2], owned: [2], updatedAt: 1 },
    });
    reloadPlayerDex();
    expect(latestPlayerDex()?.rom).toBe("b.gba");
  });

  it("JSON quebrado vira store vazio, não exceção", () => {
    memory[KEY] = "{isso não é json";
    reloadPlayerDex();
    expect(latestPlayerDex()).toBeNull();
  });

  it("sem localStorage continua funcionando na memória", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
    } as unknown as Storage);
    reloadPlayerDex();
    recordPlayerDex("Emerald.gba", "ZE", EMERALD, 1000);
    expect(latestPlayerDex()?.owned).toEqual([258]);
  });
});

const entrada: PlayerDexEntry = {
  rom: "Emerald.gba",
  playerName: "ZE",
  seen: [252, 258, 261],
  owned: [258],
  updatedAt: 1,
};

describe("playerDex — consultas", () => {
  it("dexMarkOf distingue capturado, só visto e nada", () => {
    expect(dexMarkOf(entrada, 258)).toBe("owned");
    expect(dexMarkOf(entrada, 252)).toBe("seen");
    expect(dexMarkOf(entrada, 1)).toBeUndefined();
    expect(dexMarkOf(null, 258)).toBeUndefined();
  });

  it("nationalsFor capturados", () => {
    expect(nationalsFor(entrada, "capturados")).toEqual([258]);
  });

  it("nationalsFor vistos exclui os capturados", () => {
    expect(nationalsFor(entrada, "vistos")).toEqual([252, 261]);
  });

  /** "Não vistos" é a dex daquele jogo: de 1 a 386, sem o que já foi visto. */
  it("nationalsFor faltam vai de 1 a 386 sem os vistos", () => {
    const faltam = nationalsFor(entrada, "faltam");
    expect(faltam).toHaveLength(386 - 3);
    expect(faltam[0]).toBe(1);
    expect(faltam.at(-1)).toBe(386);
    expect(faltam).not.toContain(252);
    expect(faltam).not.toContain(258);
  });

  it("parseDexFilter aceita só os três valores", () => {
    expect(parseDexFilter("capturados")).toBe("capturados");
    expect(parseDexFilter("vistos")).toBe("vistos");
    expect(parseDexFilter("faltam")).toBe("faltam");
    expect(parseDexFilter("todos")).toBeUndefined();
    expect(parseDexFilter(null)).toBeUndefined();
  });
});
