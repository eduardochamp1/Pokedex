import type { Pokemon } from "../types/pokemon";

export interface Frame {
  gen: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII";
  url: string;
  isAnimated: boolean;
}

export interface Toggles {
  shiny: boolean;
  animated: boolean;
  back: boolean;
}

const GEN_ORDER: Array<{
  gen: Frame["gen"];
  key: string;
  game: string;
  animatedGen?: boolean;
}> = [
  { gen: "I", key: "generation-i", game: "red-blue" },
  { gen: "II", key: "generation-ii", game: "crystal" },
  { gen: "III", key: "generation-iii", game: "emerald" },
  { gen: "IV", key: "generation-iv", game: "platinum" },
  { gen: "V", key: "generation-v", game: "black-white", animatedGen: true },
  { gen: "VI", key: "generation-vi", game: "x-y" },
  { gen: "VII", key: "generation-vii", game: "ultra-sun-ultra-moon" },
  { gen: "VIII", key: "generation-viii", game: "icons" },
];

type Bag = Record<string, string | null | Record<string, string | null>>;

function keyFor(t: Toggles): string {
  if (t.back && t.shiny) return "back_shiny";
  if (t.back) return "back_default";
  if (t.shiny) return "front_shiny";
  return "front_default";
}

function pickUrl(
  bag: Bag | undefined,
  t: Toggles,
  allowAnimated: boolean
): string | null {
  if (!bag) return null;
  const key = keyFor(t);
  if (t.animated && allowAnimated) {
    const anim = bag.animated as Bag | undefined;
    if (anim) {
      const v = anim[key];
      if (typeof v === "string") return v;
    }
  }
  const v = bag[key];
  return typeof v === "string" ? v : null;
}

export function extractFrames(
  sprites: Pokemon["sprites"],
  t: Toggles
): Frame[] {
  const versions = (sprites as unknown as { versions?: Record<string, Record<string, Bag>> })
    .versions;
  if (!versions) return [];
  const out: Frame[] = [];
  for (const g of GEN_ORDER) {
    const games = versions[g.key];
    if (!games) continue;
    const bag = games[g.game];
    const url = pickUrl(bag, t, !!g.animatedGen);
    if (!url) continue;
    out.push({
      gen: g.gen,
      url,
      isAnimated: !!(g.animatedGen && t.animated && url.endsWith(".gif")),
    });
  }
  return out;
}
