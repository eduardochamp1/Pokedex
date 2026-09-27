import { describe, it, expect } from "vitest";
import { applyBackup, backupFileName, collectBackup, parseBackup, summarize } from "./backup";

function armazenamento(inicial: Record<string, string>) {
  const m = new Map(Object.entries(inicial));
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    dump: () => Object.fromEntries(m),
  };
}

describe("collectBackup", () => {
  it("leva as chaves do site e deixa de fora as de outros sites e a última ROM", () => {
    const s = armazenamento({
      "pokedex:favorites": "[25]",
      "pokedex:trainer-log": "{}",
      "comparator-cart": "[]",
      "pokedex:emulator:last-rom": "emerald.gba",
      "outra-coisa": "x",
    });
    const b = collectBackup(s, new Date("2026-09-27T12:00:00Z"));
    expect(b.app).toBe("pokedex");
    expect(b.version).toBe(1);
    expect(b.exportedAt).toBe("2026-09-27T12:00:00.000Z");
    expect(Object.keys(b.data).sort()).toEqual(["comparator-cart", "pokedex:favorites", "pokedex:trainer-log"]);
  });
});

describe("parseBackup", () => {
  it("aceita o que collectBackup gera", () => {
    const b = collectBackup(armazenamento({ "pokedex:favorites": "[1]" }), new Date(0));
    expect(parseBackup(JSON.stringify(b))).toEqual(b);
  });

  it("recusa o que não é backup do site, sem lançar", () => {
    expect(parseBackup("não é json")).toBeNull();
    expect(parseBackup(JSON.stringify({ app: "outro", version: 1, data: {} }))).toBeNull();
    expect(parseBackup(JSON.stringify({ app: "pokedex", version: 99, data: {} }))).toBeNull();
    expect(parseBackup(JSON.stringify({ app: "pokedex", version: 1, exportedAt: "x", data: { "pokedex:a": 5 } }))).toBeNull();
    // Chave de fora do site dentro do arquivo não entra.
    expect(parseBackup(JSON.stringify({ app: "pokedex", version: 1, exportedAt: "x", data: { "outra": "1" } }))).toBeNull();
  });
});

describe("applyBackup", () => {
  it("substitui os dados do site e não mexe no resto nem na última ROM", () => {
    const s = armazenamento({
      "pokedex:favorites": "[1]",
      "pokedex:quiz-best": "{}",
      "pokedex:emulator:last-rom": "emerald.gba",
      "outra-coisa": "x",
    });
    applyBackup(s, { app: "pokedex", version: 1, exportedAt: "", data: { "pokedex:favorites": "[25,133]" } });
    expect(s.dump()).toEqual({
      "pokedex:favorites": "[25,133]",
      "pokedex:emulator:last-rom": "emerald.gba",
      "outra-coisa": "x",
    });
  });
});

describe("summarize", () => {
  it("conta o que o backup leva, em termos de quem usa o site", () => {
    const r = summarize({
      "pokedex:favorites": "[1,4,7]",
      "pokedex:trainer-log": JSON.stringify({ "a.gba": {}, "b.gba": {} }),
      "pokedex:player-dex": JSON.stringify({ "a.gba": {} }),
      "pokedex:quiz-best": JSON.stringify({ all: 3 }),
    });
    expect(r).toEqual({ favorites: 3, trainerCards: 2, playerDexes: 1, other: 1 });
  });
});

describe("backupFileName", () => {
  it("com a data", () => {
    expect(backupFileName(new Date(2026, 8, 27))).toBe("pokedex-dados-2026-09-27.json");
  });
});
