import { useMemo, useState } from "react";
import type { Pokemon } from "../types/pokemon";
import { useT } from "../i18n/lang";

interface Props {
  pokemon: Pokemon;
  onSelect?: (url: string | undefined) => void;
}

type Mode = "static" | "shiny" | "animated" | "animated-shiny";

const MODE_LABELS: Record<Mode, [string, string]> = {
  static: ["Normal", "Normal"],
  shiny: ["Shiny ✨", "Shiny ✨"],
  animated: ["Animado", "Animated"],
  "animated-shiny": ["Anim. ✨", "Anim. ✨"],
};

const SpriteViewer = ({ pokemon, onSelect }: Props) => {
  const [mode, setMode] = useState<Mode>("static");
  const t = useT();

  const sources = useMemo(() => {
    const art = pokemon.sprites.other?.["official-artwork"];
    const show = pokemon.sprites.other?.showdown;
    return {
      static: art?.front_default ?? pokemon.sprites.front_default ?? "",
      shiny: art?.front_shiny ?? pokemon.sprites.front_shiny ?? "",
      animated: show?.front_default ?? "",
      "animated-shiny": show?.front_shiny ?? "",
    } as Record<Mode, string>;
  }, [pokemon]);

  const available: Mode[] = (Object.keys(MODE_LABELS) as Mode[]).filter(
    (m) => !!sources[m]
  );

  const pick = (m: Mode) => {
    setMode(m);
    onSelect?.(m === "static" ? undefined : sources[m]);
  };

  return (
    <ul className="sprite-list">
      {available.map((m) => (
        <li key={m}>
          <button
            type="button"
            className={"sprite-btn" + (m === mode ? " active" : "")}
            onClick={() => pick(m)}
            aria-pressed={m === mode}
          >
            <img
              src={sources[m]}
              crossOrigin="anonymous"
              alt={t(...MODE_LABELS[m])}
              loading="lazy"
              decoding="async"
              width={64}
              height={64}
            />
            <span>{t(...MODE_LABELS[m])}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SpriteViewer;
