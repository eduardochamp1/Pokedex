/**
 * Onde encontrar um pokémon, a partir de `/pokemon/{id}/encounters`.
 *
 * A resposta vem por área, e dentro dela por jogo, com uma linha por slot de
 * encontro — o Zigzagoon da Rota 101 em Ruby são quatro linhas (20+10+10+5)
 * que somam o `max_chance` de 45. Aqui elas viram uma: área, método, faixa de
 * nível e a chance somada.
 */
import { versionOrder } from "../data/versions";
import { getLang, type Lang } from "../i18n/lang";

export interface EncounterArea {
  location_area: { name: string; url: string };
  version_details: {
    version: { name: string; url: string };
    max_chance: number;
    encounter_details: {
      min_level: number;
      max_level: number;
      chance: number;
      method: { name: string; url: string };
      condition_values: { name: string; url: string }[];
    }[];
  }[];
}

export interface EncounterRow {
  area: string;
  method: string;
  minLevel: number;
  maxLevel: number;
  /** Em %, somada entre os slots do mesmo método e condição. */
  chance: number;
  conditions: string[];
}

const REGIOES = ["kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "paldea"];

const titulo = (slug: string) =>
  slug
    .split("-")
    .map((p) => (/^\d+f$|^b\d+f$/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");

/** "hoenn-route-101-area" -> "Route 101". Nomes próprios ficam em inglês, como nos jogos. */
export function areaLabel(slug: string): string {
  let s = slug.replace(/-area$/, "");
  const prefixo = REGIOES.find((r) => s.startsWith(`${r}-`));
  if (prefixo) s = s.slice(prefixo.length + 1);
  return titulo(s);
}

const METODOS: Record<string, [string, string]> = {
  walk: ["Andando na grama", "Walking in grass"],
  surf: ["Surfando", "Surfing"],
  "old-rod": ["Old Rod", "Old Rod"],
  "good-rod": ["Good Rod", "Good Rod"],
  "super-rod": ["Super Rod", "Super Rod"],
  "rock-smash": ["Rock Smash", "Rock Smash"],
  headbutt: ["Headbutt", "Headbutt"],
  gift: ["Presente", "Gift"],
  "gift-egg": ["Ovo de presente", "Gift egg"],
  "npc-trade": ["Troca com NPC", "In-game trade"],
  "only-one": ["Encontro único", "One-time encounter"],
  static: ["Encontro único", "One-time encounter"],
  "dark-grass": ["Grama escura", "Dark grass"],
  horde: ["Horda", "Horde"],
  "roaming-grass": ["Errante (grama)", "Roaming (grass)"],
  "roaming-water": ["Errante (água)", "Roaming (water)"],
};

export function methodLabel(method: string, lang: Lang = getLang()): string {
  const par = METODOS[method];
  return par ? (lang === "en" ? par[1] : par[0]) : titulo(method);
}

export function encounterVersions(areas: EncounterArea[]): string[] {
  const vs = new Set<string>();
  for (const a of areas) for (const v of a.version_details) vs.add(v.version.name);
  return [...vs].sort((a, b) => versionOrder(a) - versionOrder(b));
}

export function encountersFor(areas: EncounterArea[], version: string): EncounterRow[] {
  const rows: EncounterRow[] = [];
  for (const a of areas) {
    const v = a.version_details.find((d) => d.version.name === version);
    if (!v) continue;
    const porChave = new Map<string, EncounterRow>();
    for (const d of v.encounter_details) {
      const conditions = d.condition_values.map((c) => c.name);
      const chave = `${d.method.name}|${conditions.join(",")}`;
      const r = porChave.get(chave);
      if (r) {
        r.minLevel = Math.min(r.minLevel, d.min_level);
        r.maxLevel = Math.max(r.maxLevel, d.max_level);
        r.chance += d.chance;
      } else {
        porChave.set(chave, {
          area: areaLabel(a.location_area.name),
          method: d.method.name,
          minLevel: d.min_level,
          maxLevel: d.max_level,
          chance: d.chance,
          conditions,
        });
      }
    }
    rows.push(...porChave.values());
  }
  return rows;
}

const CONDICOES: Record<string, [string, string]> = {
  "swarm-yes": ["enxame", "swarm"],
  "time-morning": ["manhã", "morning"],
  "time-day": ["dia", "day"],
  "time-night": ["noite", "night"],
  "season-spring": ["primavera", "spring"],
  "season-summer": ["verão", "summer"],
  "season-autumn": ["outono", "autumn"],
  "season-winter": ["inverno", "winter"],
  "radar-on": ["Poké Radar", "Poké Radar"],
};

/** Condição traduzida quando é comum; a rara vira título, sem inventar tradução. */
export function conditionLabel(name: string, lang: Lang = getLang()): string {
  const par = CONDICOES[name];
  return par ? (lang === "en" ? par[1] : par[0]) : titulo(name);
}
