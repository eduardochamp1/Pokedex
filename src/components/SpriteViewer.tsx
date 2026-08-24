import { useMemo, useState } from "react";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
}

type Mode = "static" | "animated" | "shiny" | "animated-shiny";

const SpriteViewer = ({ pokemon }: Props) => {
  const [mode, setMode] = useState<Mode>("static");

  const sources = useMemo(() => {
    const artwork = pokemon.sprites.other?.["official-artwork"];
    const showdown = pokemon.sprites.other?.showdown;
    return {
      static: artwork?.front_default ?? pokemon.sprites.front_default ?? "",
      shiny:
        artwork?.front_shiny ??
        pokemon.sprites.front_shiny ??
        pokemon.sprites.other?.home?.front_shiny ??
        "",
      animated: showdown?.front_default ?? "",
      "animated-shiny": showdown?.front_shiny ?? "",
    } as Record<Mode, string>;
  }, [pokemon]);

  const available: Mode[] = [
    "static",
    ...(sources.shiny ? (["shiny"] as Mode[]) : []),
    ...(sources.animated ? (["animated"] as Mode[]) : []),
    ...(sources["animated-shiny"] ? (["animated-shiny"] as Mode[]) : []),
  ];

  const active = sources[mode] ? mode : "static";
  const src = sources[active];
  const isAnimated = active.startsWith("animated");

  return (
    <div className="sprite-viewer">
      <div className={"sprite-frame" + (isAnimated ? " sprite-frame-animated" : "")}>
        {src ? (
          <img
            src={src}
            alt={`${pokemon.name} — ${MODE_LABELS[active]}`}
            className={"detail-image" + (isAnimated ? " detail-image-animated" : "")}
          />
        ) : (
          <div className="detail-image sprite-placeholder">?</div>
        )}
      </div>
      <div className="sprite-modes">
        {available.map((m) => (
          <button
            key={m}
            type="button"
            className={"sprite-mode" + (m === active ? " sprite-mode-active" : "")}
            onClick={() => setMode(m)}
            aria-pressed={m === active}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
};

const MODE_LABELS: Record<Mode, string> = {
  static: "Normal",
  shiny: "Shiny ✨",
  animated: "Animado",
  "animated-shiny": "Animado ✨",
};

export default SpriteViewer;
