import { describe, expect, it } from "vitest";
import { loreFor } from "./lore";
import { LORE_EVENTS } from "../data/lore";
import { MYTHS } from "../data/myths";
import { VILLAIN_TEAMS } from "../data/villains";
import { HUMAN_LEGENDS } from "../data/humans";
import { CIVILIZATIONS } from "../data/civilizations";
import { BATTLES } from "../data/battles";
import { DIMENSIONS } from "../data/dimensions";
import { GAME_GENERATIONS } from "../data/generations";
import { ITEMS } from "../data/items";
import { LANDMARKS } from "../data/landmarks";
import { BREEDING } from "../data/breeding";
import { REGIONS } from "../data/regions";
import { GENEALOGY_BRANCHES, GENEALOGY_ROOT, genealogyNames } from "../data/genealogy";
import { ERAS_EN, LORE_EVENTS_EN } from "../data/en/lore";
import { MYTHS_EN } from "../data/en/myths";
import { VILLAIN_TEAMS_EN } from "../data/en/villains";
import { HUMAN_LEGENDS_EN } from "../data/en/humans";
import { CIVILIZATIONS_EN } from "../data/en/civilizations";
import { BATTLES_EN } from "../data/en/battles";
import { DIMENSIONS_EN } from "../data/en/dimensions";
import { GAME_GENERATIONS_EN } from "../data/en/generations";
import { ITEMS_EN } from "../data/en/items";
import { LANDMARKS_EN } from "../data/en/landmarks";
import { BREEDING_EN } from "../data/en/breeding";
import { REGIONS_EN } from "../data/en/regions";
import { GENEALOGY_BRANCHES_EN, GENEALOGY_NODES_EN } from "../data/en/genealogy";

/**
 * O inglês da lore anda junto com o português. Cada coleção: toda chave do
 * português tem par em inglês, nenhum par é órfão, e os campos obrigatórios
 * vêm preenchidos.
 */
const COLECOES: [string, string[], Record<string, Record<string, unknown>>, string[]][] = [
  ["cronologia", LORE_EVENTS.map((e) => e.title), LORE_EVENTS_EN, ["title", "body"]],
  ["mitos", MYTHS.map((m) => m.id), MYTHS_EN, ["title", "region", "summary"]],
  ["vilões", VILLAIN_TEAMS.map((v) => v.id), VILLAIN_TEAMS_EN, ["region", "motivation", "fate"]],
  ["humanos", HUMAN_LEGENDS.map((h) => h.name), HUMAN_LEGENDS_EN, ["role", "region", "summary"]],
  ["civilizações", CIVILIZATIONS.map((c) => c.id), CIVILIZATIONS_EN, ["name", "region", "age", "discovery", "purpose"]],
  ["batalhas", BATTLES.map((b) => b.id), BATTLES_EN, ["title", "location", "era", "outcome", "summary"]],
  ["dimensões", DIMENSIONS.map((d) => d.id), DIMENSIONS_EN, ["name", "ruler", "access", "description"]],
  ["gerações", GAME_GENERATIONS.map((g) => String(g.id)), GAME_GENERATIONS_EN, ["gimmick"]],
  ["itens", ITEMS.map((i) => i.id), ITEMS_EN, ["summary"]],
  ["lugares", LANDMARKS.map((l) => l.id), LANDMARKS_EN, ["name", "summary"]],
  ["criação", BREEDING.map((b) => b.id), BREEDING_EN, ["title", "summary"]],
  ["regiões", REGIONS.map((r) => r.id), REGIONS_EN, ["inspiration", "summary"]],
  ["genealogia (ramos)", GENEALOGY_BRANCHES.map((b) => b.id), GENEALOGY_BRANCHES_EN, ["title", "note"]],
  ["genealogia (nós)", [...new Set(genealogyNames())], GENEALOGY_NODES_EN, ["role"]],
];

describe.each(COLECOES)("%s", (_nome, chavesPt, en, obrigatorios) => {
  it("todo verbete em português tem par em inglês", () => {
    const faltam = chavesPt.filter((k) => !(k in en));
    expect(faltam).toEqual([]);
  });

  it("nenhum par em inglês ficou órfão", () => {
    const pt = new Set(chavesPt);
    const orfaos = Object.keys(en).filter((k) => !pt.has(k));
    expect(orfaos).toEqual([]);
  });

  it("os campos obrigatórios vêm preenchidos", () => {
    const vazios = Object.entries(en).flatMap(([k, v]) =>
      obrigatorios.filter((f) => typeof v[f] !== "string" || !(v[f] as string).trim()).map((f) => `${k}.${f}`)
    );
    expect(vazios).toEqual([]);
  });
});

/** Juntas todas as strings de um valor, em profundidade. */
function textos(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(textos);
  if (v && typeof v === "object") return Object.values(v).flatMap(textos);
  return [];
}

/**
 * Português esquecido no inglês: acentos que o inglês não usa (fora o é de
 * "Pokémon") e palavras funcionais que só existem em português.
 */
const PORTUGUES = /[ãõçáíóúâêô]|\b(não|são|também|então|está|você|pelo|pela|uma|após|até|ele|ela|mas|quando|onde|seu|sua|dos|das|nos|nas|com|para|que|como|um)\b/i;

describe("o inglês não carrega português", () => {
  const en = loreFor("en");
  const todas = [
    ...Object.values(ERAS_EN),
    ...textos({ ...en, regions: en.regions.map((r) => ({ ...r, gymLeaders: [] })) }),
  ];

  it("nenhum texto em inglês com cara de português", () => {
    const suspeitos = [...new Set(todas)].filter((s) => PORTUGUES.test(s));
    expect(suspeitos).toEqual([]);
  });
});

describe("loreFor", () => {
  it("em português devolve as coleções originais", () => {
    expect(loreFor("pt").myths).toBe(MYTHS);
    expect(loreFor("pt").events).toBe(LORE_EVENTS);
  });

  it("em inglês troca o texto e preserva o resto", () => {
    const en = loreFor("en");
    const mito = en.myths.find((m) => m.id === "lake-of-rage")!;
    const original = MYTHS.find((m) => m.id === "lake-of-rage")!;
    expect(mito.title).toBe("The red Gyarados of the Lake of Rage");
    expect(mito.pokemons).toEqual(original.pokemons);
    expect(mito.color).toBe(original.color);
  });

  it("as eras da cronologia saem em inglês, na mesma ordem", () => {
    const pt = loreFor("pt").eras;
    const en = loreFor("en").eras;
    expect(en).toHaveLength(pt.length);
    expect(en[0]).toBe("Before time");
  });

  it("a árvore genealógica é traduzida em profundidade", () => {
    const en = loreFor("en");
    expect(en.genealogyRoot.role).toBe("The Original One");
    const luz = en.genealogyBranches.find((b) => b.id === "luz")!;
    expect(luz.members[0].children?.[0].children?.[0].role).toBe("Devourer of the Sun");
    expect(GENEALOGY_ROOT.role).toBe("O Pokémon Original");
  });
});
