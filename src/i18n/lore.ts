/**
 * A lore no idioma do site.
 *
 * O conteúdo curado é escrito em português, nos arquivos de `data/`. O inglês
 * vive em `data/en/`, só com os campos de texto, por chave estável (id, nome ou
 * título). Aqui os dois se juntam: em inglês, cada verbete é o português com os
 * campos de texto trocados. Pokémon, cores, fontes e ids nunca mudam.
 *
 * `lore.test.ts` garante que os dois lados andam juntos — verbete sem par em
 * inglês, par órfão ou campo vazio quebram a suíte.
 */
import { useMemo } from "react";
import { useLang, type Lang } from "./lang";
import { LORE_EVENTS, type LoreEvent } from "../data/lore";
import { MYTHS } from "../data/myths";
import { VILLAIN_TEAMS } from "../data/villains";
import { HUMAN_CATEGORY_LABELS, HUMAN_LEGENDS, type HumanCategory } from "../data/humans";
import { CIVILIZATIONS } from "../data/civilizations";
import { BATTLES } from "../data/battles";
import { DIMENSIONS } from "../data/dimensions";
import { GAME_GENERATIONS } from "../data/generations";
import { ITEMS } from "../data/items";
import { LANDMARKS, LANDMARK_KIND_LABELS, type LandmarkKind } from "../data/landmarks";
import { BREEDING } from "../data/breeding";
import { REGIONS } from "../data/regions";
import {
  GENEALOGY_BRANCHES,
  GENEALOGY_ROOT,
  type GenealogyBranch,
  type GenealogyNode,
} from "../data/genealogy";
import { ERAS_EN, LORE_EVENTS_EN } from "../data/en/lore";
import { MYTHS_EN } from "../data/en/myths";
import { VILLAIN_TEAMS_EN } from "../data/en/villains";
import { HUMAN_CATEGORY_LABELS_EN, HUMAN_LEGENDS_EN } from "../data/en/humans";
import { CIVILIZATIONS_EN } from "../data/en/civilizations";
import { BATTLES_EN } from "../data/en/battles";
import { DIMENSIONS_EN } from "../data/en/dimensions";
import { GAME_GENERATIONS_EN } from "../data/en/generations";
import { ITEMS_EN } from "../data/en/items";
import { LANDMARK_KIND_LABELS_EN, LANDMARKS_EN } from "../data/en/landmarks";
import { BREEDING_EN } from "../data/en/breeding";
import { REGIONS_EN } from "../data/en/regions";
import { GENEALOGY_BRANCHES_EN, GENEALOGY_NODES_EN } from "../data/en/genealogy";

/** Troca os campos de texto de cada item pelos do inglês, pela chave. */
export function mergeOverlay<T>(
  items: T[],
  keyOf: (item: T) => string,
  overlay: Record<string, Partial<T>>
): T[] {
  return items.map((item) => ({ ...item, ...(overlay[keyOf(item)] ?? {}) }));
}

function mergeNode(node: GenealogyNode): GenealogyNode {
  return {
    ...node,
    ...(GENEALOGY_NODES_EN[node.name] ?? {}),
    children: node.children?.map(mergeNode),
  };
}

/** Eras na ordem em que aparecem na cronologia. */
const erasOf = (events: LoreEvent[]) => Array.from(new Set(events.map((e) => e.era)));

export interface LoreBundle {
  events: LoreEvent[];
  eras: string[];
  myths: typeof MYTHS;
  villains: typeof VILLAIN_TEAMS;
  humans: typeof HUMAN_LEGENDS;
  humanCategoryLabels: Record<HumanCategory, string>;
  civilizations: typeof CIVILIZATIONS;
  battles: typeof BATTLES;
  dimensions: typeof DIMENSIONS;
  generations: typeof GAME_GENERATIONS;
  items: typeof ITEMS;
  landmarks: typeof LANDMARKS;
  landmarkKindLabels: Record<LandmarkKind, string>;
  breeding: typeof BREEDING;
  regions: typeof REGIONS;
  genealogyRoot: GenealogyNode;
  genealogyBranches: GenealogyBranch[];
}

const PT: LoreBundle = {
  events: LORE_EVENTS,
  eras: erasOf(LORE_EVENTS),
  myths: MYTHS,
  villains: VILLAIN_TEAMS,
  humans: HUMAN_LEGENDS,
  humanCategoryLabels: HUMAN_CATEGORY_LABELS,
  civilizations: CIVILIZATIONS,
  battles: BATTLES,
  dimensions: DIMENSIONS,
  generations: GAME_GENERATIONS,
  items: ITEMS,
  landmarks: LANDMARKS,
  landmarkKindLabels: LANDMARK_KIND_LABELS,
  breeding: BREEDING,
  regions: REGIONS,
  genealogyRoot: GENEALOGY_ROOT,
  genealogyBranches: GENEALOGY_BRANCHES,
};

let en: LoreBundle | null = null;

/** O inglês é montado uma vez, na primeira vez que alguém pede. */
function montarEn(): LoreBundle {
  const events = LORE_EVENTS.map((e) => ({
    ...e,
    ...(LORE_EVENTS_EN[e.title] ?? {}),
    era: ERAS_EN[e.era] ?? e.era,
  }));
  return {
    events,
    eras: erasOf(events),
    myths: mergeOverlay(MYTHS, (m) => m.id, MYTHS_EN),
    villains: mergeOverlay(VILLAIN_TEAMS, (v) => v.id, VILLAIN_TEAMS_EN),
    humans: mergeOverlay(HUMAN_LEGENDS, (h) => h.name, HUMAN_LEGENDS_EN),
    humanCategoryLabels: HUMAN_CATEGORY_LABELS_EN,
    civilizations: mergeOverlay(CIVILIZATIONS, (c) => c.id, CIVILIZATIONS_EN),
    battles: mergeOverlay(BATTLES, (b) => b.id, BATTLES_EN),
    dimensions: mergeOverlay(DIMENSIONS, (d) => d.id, DIMENSIONS_EN),
    generations: mergeOverlay(GAME_GENERATIONS, (g) => String(g.id), GAME_GENERATIONS_EN),
    items: mergeOverlay(ITEMS, (i) => i.id, ITEMS_EN),
    landmarks: mergeOverlay(LANDMARKS, (l) => l.id, LANDMARKS_EN),
    landmarkKindLabels: LANDMARK_KIND_LABELS_EN,
    breeding: mergeOverlay(BREEDING, (b) => b.id, BREEDING_EN),
    regions: mergeOverlay(REGIONS, (r) => r.id, REGIONS_EN),
    genealogyRoot: mergeNode(GENEALOGY_ROOT),
    genealogyBranches: GENEALOGY_BRANCHES.map((b) => ({
      ...b,
      ...(GENEALOGY_BRANCHES_EN[b.id] ?? {}),
      members: b.members.map(mergeNode),
    })),
  };
}

export function loreFor(lang: Lang): LoreBundle {
  if (lang === "pt") return PT;
  en ??= montarEn();
  return en;
}

export function useLore(): LoreBundle {
  const lang = useLang();
  return useMemo(() => loreFor(lang), [lang]);
}
