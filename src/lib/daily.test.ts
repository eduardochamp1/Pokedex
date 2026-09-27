import { describe, expect, it } from "vitest";
import { dailyPokemonId, dayNumber, TOTAL_SPECIES } from "./daily";

describe("dailyPokemonId", () => {
  it("o mesmo dia dá sempre o mesmo pokémon, a qualquer hora", () => {
    const manha = new Date(2026, 8, 27, 7, 0);
    const noite = new Date(2026, 8, 27, 23, 59);
    expect(dailyPokemonId(manha)).toBe(dailyPokemonId(noite));
  });

  it("dias seguidos dão pokémon diferentes", () => {
    const hoje = dailyPokemonId(new Date(2026, 8, 27));
    const amanha = dailyPokemonId(new Date(2026, 8, 28));
    expect(hoje).not.toBe(amanha);
  });

  /** A permutação passa por todas as espécies antes de repetir. */
  it("não repete em 1025 dias seguidos, e cobre todos", () => {
    const vistos = new Set<number>();
    const inicio = new Date(2026, 0, 1);
    for (let d = 0; d < TOTAL_SPECIES; d++) {
      const dia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + d);
      vistos.add(dailyPokemonId(dia));
    }
    expect(vistos.size).toBe(TOTAL_SPECIES);
    expect(Math.min(...vistos)).toBe(1);
    expect(Math.max(...vistos)).toBe(TOTAL_SPECIES);
  });

  /** Dia local, não UTC: 23h de Brasília ainda é o mesmo dia para quem vê. */
  it("conta o dia pelo calendário local", () => {
    expect(dayNumber(new Date(2026, 8, 27, 23, 30))).toBe(dayNumber(new Date(2026, 8, 27, 0, 30)));
    expect(dayNumber(new Date(2026, 8, 28))).toBe(dayNumber(new Date(2026, 8, 27)) + 1);
  });

  it("atravessa a virada do horário de verão sem pular dia", () => {
    const numeros = [];
    for (let d = 1; d <= 60; d++) numeros.push(dayNumber(new Date(2026, 9, d)));
    for (let i = 1; i < numeros.length; i++) expect(numeros[i] - numeros[i - 1]).toBe(1);
  });
});
