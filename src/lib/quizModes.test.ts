import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  DAILY_ROUNDS,
  dailyRounds,
  loadDaily,
  parseQuizMode,
  redactName,
  saveDaily,
  seededRandom,
  shareText,
  typeOptions,
} from "./quizModes";

describe("parseQuizMode", () => {
  it("silhueta é o padrão", () => {
    expect(parseQuizMode(null)).toBe("silhueta");
    expect(parseQuizMode("grito")).toBe("grito");
    expect(parseQuizMode("diario")).toBe("diario");
    expect(parseQuizMode("xyz")).toBe("silhueta");
  });
});

describe("seededRandom", () => {
  it("mesma semente, mesma sequência; entre 0 e 1", () => {
    const a = seededRandom(20000);
    const b = seededRandom(20000);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(seededRandom(20001)()).not.toBe(xs[0]);
  });
});

describe("dailyRounds", () => {
  it("o mesmo desafio para todo mundo no mesmo dia, e outro no dia seguinte", () => {
    const hoje = dailyRounds(20000);
    expect(hoje).toHaveLength(DAILY_ROUNDS);
    expect(dailyRounds(20000)).toEqual(hoje);
    expect(dailyRounds(20001)).not.toEqual(hoje);
  });

  it("passa por todos os modos e não repete pokémon", () => {
    const r = dailyRounds(20000);
    expect(new Set(r.map((x) => x.mode))).toEqual(new Set(["silhueta", "grito", "descricao", "tipo"]));
    expect(new Set(r.map((x) => x.round.answer)).size).toBe(DAILY_ROUNDS);
    for (const x of r) expect(x.round.options).toContain(x.round.answer);
  });
});

describe("typeOptions", () => {
  it("quatro combinações distintas, uma delas a certa", () => {
    const o = typeOptions(["grass", "poison"], seededRandom(7));
    expect(o).toHaveLength(4);
    expect(new Set(o.map((x) => x.join("/"))).size).toBe(4);
    expect(o.some((x) => x.join("/") === "grass/poison")).toBe(true);
  });
});

describe("redactName", () => {
  it("esconde o nome em qualquer caixa, e só palavra inteira", () => {
    expect(redactName("PIKACHU stores electricity. Pikachu is cute.", ["pikachu"])).toBe(
      "▢▢▢ stores electricity. ▢▢▢ is cute."
    );
    expect(redactName("A Mew-like aura in Mewtwo.", ["mew"])).toBe("A ▢▢▢-like aura in Mewtwo.");
    expect(redactName("Mr. Mime makes walls.", ["mr. mime", "mr-mime"])).toBe("▢▢▢ makes walls.");
  });
});

describe("registro do dia e compartilhar", () => {
  const memoria: Record<string, string> = {};
  beforeEach(() => {
    for (const k of Object.keys(memoria)) delete memoria[k];
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => memoria[k] ?? null,
      setItem: (k: string, v: string) => void (memoria[k] = v),
    } as unknown as Storage);
  });

  it("guarda o resultado do dia e esquece o de ontem", () => {
    expect(loadDaily(20000)).toBeNull();
    saveDaily(20000, [true, false]);
    expect(loadDaily(20000)).toEqual([true, false]);
    expect(loadDaily(20001)).toBeNull();
  });

  it("texto com a data, a nota e os quadrados", () => {
    // Dia 20000 desde 1970-01-01 é 2024-10-04.
    expect(shareText(20000, [true, true, false, true, true], "pt")).toBe(
      "Quiz Pokédex 04/10/2024 — 4/5\n🟩🟩🟥🟩🟩"
    );
    expect(shareText(20000, [true, true, false, true, true], "en")).toBe(
      "Pokédex Quiz 2024-10-04 — 4/5\n🟩🟩🟥🟩🟩"
    );
  });
});
