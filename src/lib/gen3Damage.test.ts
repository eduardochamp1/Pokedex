import { describe, it, expect } from "vitest";
import {
  calcGen3Damage,
  gen3MoveData,
  gen3PokemonTypes,
  gen3TypeMultiplier,
  hitsToKo,
  isPhysicalGen3,
} from "./gen3Damage";

const base = {
  level: 100,
  attack: 200,
  defense: 100,
  power: 100,
  moveType: "normal" as const,
  attackerTypes: ["water" as const],
  defenderTypes: ["normal" as const] as ("normal" | "water" | "ghost" | "rock" | "steel")[],
};

describe("gen3TypeMultiplier", () => {
  it("Aço resistia a Fantasma e Sombrio", () => {
    expect(gen3TypeMultiplier("ghost", ["steel"])).toBe(0.5);
    expect(gen3TypeMultiplier("dark", ["steel"])).toBe(0.5);
  });
  it("o resto é a tabela de sempre", () => {
    expect(gen3TypeMultiplier("water", ["fire", "rock"])).toBe(4);
    expect(gen3TypeMultiplier("ground", ["flying"])).toBe(0);
    expect(gen3TypeMultiplier("fighting", ["normal"])).toBe(2);
  });
});

describe("isPhysicalGen3", () => {
  it("é o tipo que decide, não o golpe", () => {
    expect(isPhysicalGen3("ghost")).toBe(true);
    expect(isPhysicalGen3("dark")).toBe(false);
    expect(isPhysicalGen3("fire")).toBe(false);
    expect(isPhysicalGen3("steel")).toBe(true);
  });
});

describe("calcGen3Damage", () => {
  it("dano base: ⌊⌊200·100·42/100⌋/50⌋ + 2 = 170, rolagens de 85% a 100%", () => {
    const r = calcGen3Damage(base);
    expect(r.max).toBe(170);
    expect(r.min).toBe(144); // ⌊170·85/100⌋
    expect(r.rolls).toHaveLength(16);
    expect(r.rolls[0]).toBe(144);
    expect(r.rolls[15]).toBe(170);
  });

  it("STAB ×1,5 e depois o tipo, arredondando a cada passo", () => {
    // 170 → STAB 255 → super efetivo 510
    const r = calcGen3Damage({ ...base, moveType: "grass", attackerTypes: ["grass"], defenderTypes: ["water"] });
    expect(r.max).toBe(510);
    expect(r.effectiveness).toBe(2);
  });

  it("crítico dobra depois do +2; imunidade dá zero", () => {
    expect(calcGen3Damage({ ...base, crit: true }).max).toBe(340);
    const nada = calcGen3Damage({ ...base, defenderTypes: ["ghost"] });
    expect(nada).toMatchObject({ min: 0, max: 0, effectiveness: 0 });
  });

  it("queimadura corta o físico ao meio, antes do +2", () => {
    // ⌊168/2⌋ + 2 = 86
    expect(calcGen3Damage({ ...base, burned: true }).max).toBe(86);
    // e não mexe no especial
    expect(calcGen3Damage({ ...base, moveType: "psychic", burned: true }).max).toBe(170);
  });

  it("clima só no especial: chuva ×1,5 na água, sol corta água", () => {
    // ⌊168·15/10⌋ + 2 = 254
    expect(calcGen3Damage({ ...base, moveType: "water", attackerTypes: ["fire"], weather: "rain" }).max).toBe(254);
    expect(calcGen3Damage({ ...base, moveType: "water", attackerTypes: ["fire"], weather: "sun" }).max).toBe(86);
  });

  it("habilidades: Huge Power dobra o ataque físico; Thick Fat e Levitate", () => {
    // ⌊⌊400·100·42/100⌋/50⌋ + 2 = 338
    expect(calcGen3Damage({ ...base, attackerAbility: "huge-power" }).max).toBe(338);
    // Thick Fat corta o ataque ao meio contra fogo: ⌊⌊100·100·42/100⌋/50⌋ + 2 = 86
    expect(calcGen3Damage({ ...base, moveType: "fire", defenderAbility: "thick-fat" }).max).toBe(86);
    expect(calcGen3Damage({ ...base, moveType: "ground", defenderAbility: "levitate" }).max).toBe(0);
  });

  it("dano mínimo é 1 quando o golpe acerta", () => {
    const fraco = calcGen3Damage({ ...base, level: 2, attack: 5, defense: 300, power: 10, defenderTypes: ["rock", "steel"] });
    expect(fraco.min).toBeGreaterThanOrEqual(1);
  });
});

describe("hitsToKo", () => {
  it("garantido quando o mínimo basta; chance quando só o máximo basta", () => {
    expect(hitsToKo({ min: 50, max: 60 }, 100)).toEqual({ hits: 2, guaranteed: true });
    expect(hitsToKo({ min: 40, max: 55 }, 100)).toEqual({ hits: 2, guaranteed: false });
    expect(hitsToKo({ min: 0, max: 0 }, 100)).toBeNull();
  });
});

describe("dados de Gen 3", () => {
  it("golpe com poder ou tipo mudados depois usa o valor antigo", () => {
    // Bite era Normal até a Gen 2; Crabhammer tinha 90 até a Gen 5; em Gen 6 mudou de novo.
    const crab = {
      power: 100,
      type: { name: "water", url: "" },
      past_values: [
        { power: 90, type: null, version_group: { name: "x-y" } },
      ],
    };
    expect(gen3MoveData(crab)).toEqual({ power: 90, type: "water" });
    const antes = {
      power: 60,
      type: { name: "dark", url: "" },
      past_values: [{ power: null, type: { name: "normal", url: "" }, version_group: { name: "gold-silver" } }],
    };
    expect(gen3MoveData(antes)).toEqual({ power: 60, type: "dark" });
    // Duas mudanças depois da Gen 3: vale a mais antiga delas.
    const duas = {
      power: 120,
      type: { name: "fire", url: "" },
      past_values: [
        { power: 110, type: null, version_group: { name: "sun-moon" } },
        { power: 95, type: null, version_group: { name: "black-white" } },
      ],
    };
    expect(gen3MoveData(duas).power).toBe(95);
  });

  it("pokémon que ganhou Fada depois volta ao tipo antigo", () => {
    const clefairy = {
      types: [{ slot: 1, type: { name: "fairy", url: "" } }],
      past_types: [{ generation: { name: "generation-v" }, types: [{ slot: 1, type: { name: "normal", url: "" } }] }],
    };
    expect(gen3PokemonTypes(clefairy)).toEqual(["normal"]);
    const mudkip = { types: [{ slot: 1, type: { name: "water", url: "" } }] };
    expect(gen3PokemonTypes(mudkip)).toEqual(["water"]);
  });
});
