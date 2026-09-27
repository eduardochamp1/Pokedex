import { describe, expect, it } from "vitest";
import { gen3Abilities, abilityForGen3Slot, moveSlugById } from "./teamSheet";
import type { PokemonAbility, PastAbilities, PokemonMove } from "../types/pokemon";

const hab = (name: string, slot: number, is_hidden = false): PokemonAbility => ({
  is_hidden,
  slot,
  ability: { name, url: `https://pokeapi.co/api/v2/ability/${name}/` },
});

// Formato real da PokéAPI, copiado das respostas de /pokemon/gengar e /mudkip.
const GENGAR = {
  abilities: [hab("cursed-body", 1)],
  past_abilities: [
    {
      generation: { name: "generation-vi", url: "https://pokeapi.co/api/v2/generation/6/" },
      abilities: [{ is_hidden: false, slot: 1, ability: { name: "levitate", url: "" } }],
    },
  ] as PastAbilities[],
};
const MUDKIP = {
  abilities: [hab("torrent", 1), hab("damp", 3, true)],
  past_abilities: [
    {
      generation: { name: "generation-iv", url: "https://pokeapi.co/api/v2/generation/4/" },
      abilities: [{ is_hidden: true, slot: 3, ability: null }],
    },
  ] as PastAbilities[],
};

describe("gen3Abilities", () => {
  it("usa a habilidade de antes da mudança: Gengar tinha Levitate", () => {
    expect(gen3Abilities(GENGAR)).toEqual(["levitate"]);
  });

  it("habilidade oculta não existia em Gen 3", () => {
    expect(gen3Abilities(MUDKIP)).toEqual(["torrent"]);
  });

  it("sem past_abilities, fica com as comuns de hoje, na ordem do slot", () => {
    expect(gen3Abilities({ abilities: [hab("b", 2), hab("a", 1), hab("h", 3, true)] })).toEqual([
      "a",
      "b",
    ]);
  });

  /** Com duas mudanças, vale a mais próxima depois de Gen 3. */
  it("com várias entradas, vale a da menor geração depois da III", () => {
    const p = {
      abilities: [hab("hoje", 1)],
      past_abilities: [
        { generation: { name: "generation-vii", url: "" }, abilities: [{ is_hidden: false, slot: 1, ability: { name: "gen6", url: "" } }] },
        { generation: { name: "generation-v", url: "" }, abilities: [{ is_hidden: false, slot: 1, ability: { name: "gen3e4", url: "" } }] },
        { generation: { name: "generation-iii", url: "" }, abilities: [{ is_hidden: false, slot: 1, ability: { name: "gen1e2", url: "" } }] },
      ] as PastAbilities[],
    };
    expect(gen3Abilities(p)).toEqual(["gen3e4"]);
  });
});

describe("abilityForGen3Slot", () => {
  const DUAS = { abilities: [hab("overgrow", 1), hab("chlorophyll", 2)] };

  it("slot 0 e 1 escolhem entre as duas", () => {
    expect(abilityForGen3Slot(DUAS, 0)).toBe("overgrow");
    expect(abilityForGen3Slot(DUAS, 1)).toBe("chlorophyll");
  });

  /** Espécie de uma habilidade só: o bit do save não importa. */
  it("com uma habilidade só, o slot 1 cai na única", () => {
    expect(abilityForGen3Slot(MUDKIP, 1)).toBe("torrent");
  });
});

describe("moveSlugById", () => {
  const moves = [
    { move: { name: "tackle", url: "https://pokeapi.co/api/v2/move/33/" }, version_group_details: [] },
    { move: { name: "mud-slap", url: "https://pokeapi.co/api/v2/move/189/" }, version_group_details: [] },
  ] as PokemonMove[];

  it("acha o golpe pelo número na url", () => {
    expect(moveSlugById(moves, 189)).toBe("mud-slap");
  });

  it("golpe que a espécie não lista devolve undefined", () => {
    expect(moveSlugById(moves, 1)).toBeUndefined();
  });
});
