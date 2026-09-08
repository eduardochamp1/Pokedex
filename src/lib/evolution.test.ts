import { describe, expect, it } from "vitest";
import { evolutionConditionText } from "./evolution";
import type { EvolutionDetail } from "../types/pokemon";

const base: EvolutionDetail = {
  trigger: { name: "level-up", url: "" },
  min_level: null,
  item: null,
  held_item: null,
  known_move: null,
  location: null,
  min_happiness: null,
  min_affection: null,
  min_beauty: null,
  needs_overworld_rain: false,
  time_of_day: "",
  turn_upside_down: false,
  gender: null,
  trade_species: null,
};

describe("evolutionConditionText", () => {
  it("nivel simples", () => {
    expect(evolutionConditionText({ ...base, min_level: 16 })).toBe("nível 16");
  });

  it("pedra de evolucao", () => {
    expect(
      evolutionConditionText({
        ...base,
        trigger: { name: "use-item", url: "" },
        item: { name: "fire-stone", url: "" },
      })
    ).toBe("Fire Stone");
  });

  it("felicidade combina com hora do dia", () => {
    expect(
      evolutionConditionText({
        ...base,
        min_happiness: 160,
        time_of_day: "day",
      })
    ).toBe("amizade 160, de dia");
  });

  it("troca", () => {
    expect(
      evolutionConditionText({ ...base, trigger: { name: "trade", url: "" } })
    ).toBe("troca");
  });

  it("troca com item segurado", () => {
    expect(
      evolutionConditionText({
        ...base,
        trigger: { name: "trade", url: "" },
        held_item: { name: "metal-coat", url: "" },
      })
    ).toBe("troca segurando Metal Coat");
  });

  it("golpe conhecido", () => {
    expect(
      evolutionConditionText({
        ...base,
        min_level: 25,
        known_move: { name: "ancient-power", url: "" },
      })
    ).toBe("nível 25 sabendo Ancient Power");
  });

  it("caso sem nenhuma condicao legivel nao inventa texto", () => {
    expect(evolutionConditionText({ ...base })).toBe("");
  });

  it("undefined nao explode", () => {
    expect(evolutionConditionText(undefined)).toBe("");
  });
});
