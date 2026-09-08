import { describe, expect, it } from "vitest";
import { REGIONS } from "./regions";
import { REGION_SHAPES } from "./regionMap";
import { LANDMARKS, LANDMARK_KIND_LABELS } from "./landmarks";
import { ITEMS } from "./items";
import { HUMAN_LEGENDS } from "./humans";
import { VILLAIN_TEAMS } from "./villains";
import { MYTHS } from "./myths";
import { BATTLES } from "./battles";
import { CIVILIZATIONS } from "./civilizations";
import { DIMENSIONS } from "./dimensions";
import { GAME_GENERATIONS } from "./generations";

/**
 * Testes de integridade do conteudo curado. Nao verificam se a lore esta
 * "certa" — verificam que os ~120 verbetes escritos a mao nao tem id
 * duplicado, referencia de regiao invalida ou campo de fonte mal formado.
 */

const dupes = (values: string[]) =>
  values.filter((v, i) => values.indexOf(v) !== i);

describe("ids", () => {
  it.each([
    ["landmarks", LANDMARKS.map((l) => l.id)],
    ["items", ITEMS.map((i) => i.id)],
    ["villains", VILLAIN_TEAMS.map((v) => v.id)],
    ["myths", MYTHS.map((m) => m.id)],
    ["battles", BATTLES.map((b) => b.id)],
    ["civilizations", CIVILIZATIONS.map((c) => c.id)],
    ["dimensions", DIMENSIONS.map((d) => d.id)],
    ["regions", REGIONS.map((r) => r.id)],
  ])("%s não tem id duplicado", (_label, ids) => {
    expect(dupes(ids)).toEqual([]);
  });

  it("humanos não têm nome duplicado", () => {
    expect(dupes(HUMAN_LEGENDS.map((h) => h.name))).toEqual([]);
  });
});

describe("landmarks", () => {
  const regionIds = new Set(REGIONS.map((r) => r.id));

  it("todo local aponta para uma região existente", () => {
    const orphans = LANDMARKS.filter((l) => !regionIds.has(l.regionId));
    expect(orphans.map((l) => `${l.id} -> ${l.regionId}`)).toEqual([]);
  });

  it("todo local tem um tipo com rótulo definido", () => {
    const unlabeled = LANDMARKS.filter((l) => !LANDMARK_KIND_LABELS[l.kind]);
    expect(unlabeled.map((l) => l.id)).toEqual([]);
  });

  it("todo local cita ao menos um pokémon", () => {
    const empty = LANDMARKS.filter((l) => l.pokemons.length === 0);
    expect(empty.map((l) => l.id)).toEqual([]);
  });

  it("toda região do mapa tem ao menos um local", () => {
    const covered = new Set(LANDMARKS.map((l) => l.regionId));
    const uncovered = REGIONS.filter((r) => !covered.has(r.id));
    expect(uncovered.map((r) => r.id)).toEqual([]);
  });
});

describe("regiões", () => {
  it("toda região tem forma no mapa e vice-versa", () => {
    const shapeIds = new Set(REGION_SHAPES.map((s) => s.id));
    const regionIds = new Set(REGIONS.map((r) => r.id));
    expect(REGIONS.filter((r) => !shapeIds.has(r.id)).map((r) => r.id)).toEqual([]);
    expect(
      REGION_SHAPES.filter((s) => !regionIds.has(s.id)).map((s) => s.id)
    ).toEqual([]);
  });

  it("as gerações das regiões são 1..9 sem repetição", () => {
    const gens = REGIONS.map((r) => r.generation).sort((a, b) => a - b);
    expect(gens).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("itens", () => {
  it("apiSlug, quando existe, tem forma de slug da PokéAPI", () => {
    const bad = ITEMS.filter(
      (i) => i.apiSlug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.apiSlug)
    );
    expect(bad.map((i) => `${i.id}: ${i.apiSlug}`)).toEqual([]);
  });

  it("não há dois itens usando o mesmo sprite", () => {
    const slugs = ITEMS.map((i) => i.apiSlug).filter((s): s is string => !!s);
    expect(dupes(slugs)).toEqual([]);
  });

  it("toda categoria de item é uma das cinco previstas", () => {
    const valid = ["pokebola", "sagrado", "chave", "cristal", "livro"];
    const bad = ITEMS.filter((i) => !valid.includes(i.category));
    expect(bad.map((i) => i.id)).toEqual([]);
  });
});

describe("fontes citadas", () => {
  const withWiki = [
    ...LANDMARKS,
    ...ITEMS,
    ...HUMAN_LEGENDS,
    ...VILLAIN_TEAMS,
    ...MYTHS,
    ...BATTLES,
    ...CIVILIZATIONS,
    ...DIMENSIONS,
    ...REGIONS,
    ...GAME_GENERATIONS,
  ];

  it("nenhum título de wiki vem vazio ou com espaço nas pontas", () => {
    const bad = withWiki
      .map((e) => e.wiki)
      .filter((w): w is string => w !== undefined)
      .filter((w) => w.length === 0 || w !== w.trim());
    expect(bad).toEqual([]);
  });

  it("nenhum título de wiki vem como URL — o helper monta o link", () => {
    const bad = withWiki
      .map((e) => e.wiki)
      .filter((w): w is string => w !== undefined)
      .filter((w) => /^https?:\/\//.test(w));
    expect(bad).toEqual([]);
  });

  it("a cobertura de fontes é total nas coleções principais", () => {
    for (const [label, list] of [
      ["landmarks", LANDMARKS],
      ["humans", HUMAN_LEGENDS],
      ["villains", VILLAIN_TEAMS],
      ["myths", MYTHS],
      ["battles", BATTLES],
      ["regions", REGIONS],
    ] as const) {
      const missing = list.filter((e) => !e.wiki);
      expect(missing, `${label} sem fonte`).toEqual([]);
    }
  });
});
