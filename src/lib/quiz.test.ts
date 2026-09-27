import { describe, expect, it, beforeEach, vi } from "vitest";
import { GEN_RANGES, poolFor, makeRound, loadBest, saveBest, parseQuizGen } from "./quiz";

/** Gerador determinístico (mulberry32) para os testes. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("poolFor", () => {
  it("as nove gerações cobrem 1..1025 sem buraco", () => {
    expect(GEN_RANGES).toHaveLength(9);
    expect(GEN_RANGES[0][0]).toBe(1);
    expect(GEN_RANGES[8][1]).toBe(1025);
    for (let i = 1; i < 9; i++) expect(GEN_RANGES[i][0]).toBe(GEN_RANGES[i - 1][1] + 1);
  });

  it("Gen III é 252 a 386", () => {
    const p = poolFor(3);
    expect(p[0]).toBe(252);
    expect(p.at(-1)).toBe(386);
    expect(p).toHaveLength(135);
  });

  it("todas é 1..1025", () => {
    expect(poolFor("all")).toHaveLength(1025);
  });
});

describe("makeRound", () => {
  it("quatro opções distintas, a resposta entre elas, todas do recorte", () => {
    const rand = seeded(42);
    for (let i = 0; i < 200; i++) {
      const r = makeRound(poolFor(1), rand);
      expect(r.options).toHaveLength(4);
      expect(new Set(r.options).size).toBe(4);
      expect(r.options).toContain(r.answer);
      for (const o of r.options) expect(o >= 1 && o <= 151).toBe(true);
    }
  });

  /** A resposta não pode cair sempre na mesma posição. */
  it("a posição da resposta varia", () => {
    const rand = seeded(7);
    const posicoes = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const r = makeRound(poolFor("all"), rand);
      posicoes.add(r.options.indexOf(r.answer));
    }
    expect(posicoes.size).toBe(4);
  });

  it("evita repetir a última resposta", () => {
    const rand = seeded(1);
    let anterior: number | undefined;
    for (let i = 0; i < 300; i++) {
      const r = makeRound([1, 2, 3, 4, 5], rand, anterior);
      expect(r.answer).not.toBe(anterior);
      anterior = r.answer;
    }
  });
});

describe("recorde", () => {
  const memory: Record<string, string> = {};
  beforeEach(() => {
    for (const k of Object.keys(memory)) delete memory[k];
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => (k in memory ? memory[k] : null),
      setItem: (k: string, v: string) => {
        memory[k] = v;
      },
    } as unknown as Storage);
  });

  it("por recorte, e só sobe", () => {
    expect(loadBest("all")).toBe(0);
    saveBest(3, 5);
    saveBest(3, 2);
    saveBest("all", 9);
    expect(loadBest(3)).toBe(5);
    expect(loadBest("all")).toBe(9);
    expect(loadBest(1)).toBe(0);
  });

  it("lixo gravado vira zero", () => {
    memory["pokedex:quiz-best"] = "{isso não";
    expect(loadBest(3)).toBe(0);
  });
});

describe("parseQuizGen", () => {
  it("aceita 1..9 e 'all'", () => {
    expect(parseQuizGen("3")).toBe(3);
    expect(parseQuizGen(null)).toBe("all");
    expect(parseQuizGen("10")).toBe("all");
    expect(parseQuizGen("abc")).toBe("all");
  });
});
