import { useMemo, useState } from "react";
import { extractFrames, type Toggles } from "../hooks/useSpriteFrames";
import type { Pokemon } from "../types/pokemon";

interface Props {
  pokemon: Pokemon;
}

const SpriteScrubber = ({ pokemon }: Props) => {
  const [toggles, setToggles] = useState<Toggles>({
    shiny: false,
    animated: false,
    back: false,
  });
  const [index, setIndex] = useState(0);

  const frames = useMemo(
    () => extractFrames(pokemon.sprites, toggles),
    [pokemon.sprites, toggles]
  );

  const safeIndex = Math.min(index, Math.max(0, frames.length - 1));
  const current = frames[safeIndex];

  return (
    <div className="sprite-scrubber">
      <div className="sprite-scrubber-stage">
        {current ? (
          <img
            src={current.url}
            alt={`${pokemon.name} — Geração ${current.gen}`}
            crossOrigin="anonymous"
            loading={current.isAnimated ? "lazy" : "eager"}
          />
        ) : (
          <span className="sprite-scrubber-empty">
            Sem sprite disponível para este filtro
          </span>
        )}
      </div>
      {frames.length > 0 && (
        <>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={safeIndex}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Deslizar por geração"
            className="sprite-scrubber-range"
          />
          <div className="sprite-scrubber-label">Geração {current?.gen}</div>
        </>
      )}
      <div className="sprite-scrubber-toggles">
        <label>
          <input
            type="checkbox"
            checked={toggles.shiny}
            onChange={(e) =>
              setToggles((t) => ({ ...t, shiny: e.target.checked }))
            }
          />{" "}
          ✨ Shiny
        </label>
        <label>
          <input
            type="checkbox"
            checked={toggles.animated}
            onChange={(e) =>
              setToggles((t) => ({ ...t, animated: e.target.checked }))
            }
          />{" "}
          🎬 Animado
        </label>
        <label>
          <input
            type="checkbox"
            checked={toggles.back}
            onChange={(e) =>
              setToggles((t) => ({ ...t, back: e.target.checked }))
            }
          />{" "}
          ↩️ Costas
        </label>
      </div>
    </div>
  );
};

export default SpriteScrubber;
