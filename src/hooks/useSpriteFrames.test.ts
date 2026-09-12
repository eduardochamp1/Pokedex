import { describe, expect, it } from "vitest";
import { extractFrames } from "./useSpriteFrames";
import type { Pokemon } from "../types/pokemon";

const bulbaSprites = {
  front_default: "https://home/1.png",
  versions: {
    "generation-i": {
      "red-blue": {
        front_default: "https://rb/1.png",
        back_default: "https://rb/back-1.png",
      },
    },
    "generation-ii": {
      crystal: {
        front_default: "https://crystal/1.png",
        front_shiny: "https://crystal/s1.png",
      },
    },
    "generation-v": {
      "black-white": {
        front_default: "https://bw/1.png",
        front_shiny: "https://bw/s1.png",
        animated: {
          front_default: "https://bw/1.gif",
          front_shiny: "https://bw/s1.gif",
        },
      },
    },
  },
} as unknown as Pokemon["sprites"];

describe("extractFrames", () => {
  it("devolve um frame por geracao onde o sprite existe", () => {
    const frames = extractFrames(bulbaSprites, {
      shiny: false,
      animated: false,
      back: false,
    });
    expect(frames.map((f) => f.gen)).toEqual(["I", "II", "V"]);
  });

  it("shiny troca a URL quando disponivel", () => {
    const frames = extractFrames(bulbaSprites, {
      shiny: true,
      animated: false,
      back: false,
    });
    expect(frames.find((f) => f.gen === "II")?.url).toBe(
      "https://crystal/s1.png"
    );
  });

  it("animated so aplica na Gen V, fallback estatico nas outras", () => {
    const frames = extractFrames(bulbaSprites, {
      shiny: false,
      animated: true,
      back: false,
    });
    const gen5 = frames.find((f) => f.gen === "V");
    expect(gen5?.url).toBe("https://bw/1.gif");
    expect(gen5?.isAnimated).toBe(true);
    expect(frames.find((f) => f.gen === "I")?.isAnimated).toBe(false);
  });

  it("back troca pro back_default quando existe", () => {
    const frames = extractFrames(bulbaSprites, {
      shiny: false,
      animated: false,
      back: true,
    });
    expect(frames.find((f) => f.gen === "I")?.url).toBe("https://rb/back-1.png");
  });

  it("pula geracao onde o pokemon nao existia", () => {
    const frames = extractFrames(
      { versions: { "generation-vi": {} } } as unknown as Pokemon["sprites"],
      { shiny: false, animated: false, back: false }
    );
    expect(frames).toEqual([]);
  });
});
