import { describe, expect, it } from "vitest";
import { abilityHolders } from "./abilityHolders";

const p = (name: string, id: number, is_hidden = false) => ({
  is_hidden,
  slot: is_hidden ? 3 : 1,
  pokemon: { name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` },
});

describe("abilityHolders", () => {
  it("separa comum de oculta e ordena pela dex", () => {
    const h = abilityHolders({
      pokemon: [p("haunter", 93), p("gastly", 92), p("mudkip", 258, true)],
    });
    expect(h.regular).toEqual([
      { name: "gastly", id: 92 },
      { name: "haunter", id: 93 },
    ]);
    expect(h.hidden).toEqual([{ name: "mudkip", id: 258 }]);
  });

  /** Formas (Mega, regionais) têm id acima de 10000: vão depois das espécies. */
  it("formas vêm depois das espécies", () => {
    const h = abilityHolders({ pokemon: [p("gengar-mega", 10038), p("gastly", 92)] });
    expect(h.regular.map((x) => x.name)).toEqual(["gastly", "gengar-mega"]);
  });

  it("sem lista, listas vazias", () => {
    expect(abilityHolders({})).toEqual({ regular: [], hidden: [] });
  });
});
