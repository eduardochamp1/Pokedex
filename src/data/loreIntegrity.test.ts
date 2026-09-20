import { describe, expect, it } from "vitest";
import { REGIONS } from "./regions";
import { REGION_SHAPES } from "./regionMap";
import { LANDMARKS, LANDMARK_KIND_LABELS } from "./landmarks";
import { ITEMS } from "./items";
import {
  HUMAN_CATEGORY_LABELS,
  HUMAN_CATEGORY_ORDER,
  HUMAN_LEGENDS,
} from "./humans";
import { VILLAIN_TEAMS } from "./villains";
import { MYTHS } from "./myths";
import { BATTLES } from "./battles";
import { CIVILIZATIONS } from "./civilizations";
import { DIMENSIONS } from "./dimensions";
import { GAME_GENERATIONS } from "./generations";
import { LORE_EVENTS } from "./lore";
import {
  GENEALOGY_BRANCHES,
  GENEALOGY_ROOT,
  genealogyNames,
  type GenealogyNode,
} from "./genealogy";

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

describe("dimensoes", () => {
  // A assinatura vira caminho de sprite na cena do card: se vier vazia ou
  // fora do formato, a dimensao aparece sem habitante e sem erro.
  it("toda dimensao tem assinatura em forma de slug", () => {
    for (const d of DIMENSIONS) {
      expect(d.signature, d.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("genealogia", () => {
  const flat = (n: GenealogyNode): GenealogyNode[] => [
    n,
    ...(n.children ?? []).flatMap(flat),
  ];
  const nodes = GENEALOGY_BRANCHES.flatMap((b) => b.members.flatMap(flat));

  it("nenhum cla tem id duplicado", () => {
    expect(dupes(GENEALOGY_BRANCHES.map((b) => b.id))).toEqual([]);
  });

  it("todo cla tem titulo, nota e ao menos um membro", () => {
    for (const b of GENEALOGY_BRANCHES) {
      expect(b.title.trim(), b.id).not.toBe("");
      expect(b.note.trim(), b.id).not.toBe("");
      expect(b.members.length, b.id).toBeGreaterThan(0);
    }
  });

  // O nome vira rota (/pokemon/<name>) e caminho de sprite: um maiusculo
  // ou um espaco a mais quebra os dois sem erro visivel.
  it("todo nome tem forma de slug", () => {
    for (const n of [GENEALOGY_ROOT, ...nodes]) {
      expect(n.name, n.name).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("todo no tem papel descrito", () => {
    for (const n of [GENEALOGY_ROOT, ...nodes]) {
      expect(n.role.trim(), n.name).not.toBe("");
    }
  });

  it("nenhum pokemon aparece em dois clas", () => {
    expect(dupes(nodes.map((n) => n.name))).toEqual([]);
  });

  it("a raiz nao se repete como membro de um cla", () => {
    expect(nodes.map((n) => n.name)).not.toContain(GENEALOGY_ROOT.name);
  });

  // genealogyNames alimenta o indice de sprites da Lore inteira: se ela
  // deixar um nome de fora, o chip daquele pokemon abre sem imagem.
  it("genealogyNames cobre a raiz e toda a descendencia, sem repetir", () => {
    const esperado = [GENEALOGY_ROOT.name, ...nodes.map((n) => n.name)];
    expect(genealogyNames().sort()).toEqual(esperado.sort());
    expect(dupes(genealogyNames())).toEqual([]);
  });
});

describe("humanos", () => {
  it("todo humano cai num grupo que a aba sabe desenhar", () => {
    const soltos = HUMAN_LEGENDS.filter(
      (h) => !HUMAN_CATEGORY_ORDER.includes(h.category)
    );
    expect(soltos.map((h) => `${h.name} -> ${h.category}`)).toEqual([]);
  });

  it("todo grupo da ordem tem rótulo e ao menos um humano", () => {
    const vazios = HUMAN_CATEGORY_ORDER.filter(
      (c) => !HUMAN_CATEGORY_LABELS[c] || !HUMAN_LEGENDS.some((h) => h.category === c)
    );
    expect(vazios).toEqual([]);
  });

  // A cor vivia num Record indexado por nome dentro da pagina: renomear um
  // humano derrubava a cor em silencio. Agora ela e obrigatoria no dado.
  it("todo humano tem cor em hexadecimal", () => {
    const ruins = HUMAN_LEGENDS.filter((h) => !/^#[0-9a-f]{6}$/i.test(h.color));
    expect(ruins.map((h) => `${h.name}: ${h.color}`)).toEqual([]);
  });

  // A arte do card e o time: sem pokemon, o card abre com o slot vazio.
  it("todo humano cita ao menos um pokémon", () => {
    const vazios = HUMAN_LEGENDS.filter((h) => h.pokemons.length === 0);
    expect(vazios.map((h) => h.name)).toEqual([]);
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

  // A cronologia repete titulo? O render usa event.title como key da lista.
  it("nenhum evento da cronologia repete titulo", () => {
    expect(dupes(LORE_EVENTS.map((e) => e.title))).toEqual([]);
  });

  it("a cobertura de fontes é total nas coleções principais", () => {
    for (const [label, list] of [
      ["landmarks", LANDMARKS],
      ["humans", HUMAN_LEGENDS],
      ["villains", VILLAIN_TEAMS],
      ["myths", MYTHS],
      ["battles", BATTLES],
      ["regions", REGIONS],
      ["lore", LORE_EVENTS],
    ] as const) {
      const missing = list.filter((e) => !e.wiki);
      expect(missing, `${label} sem fonte`).toEqual([]);
    }
  });
});
