import { useState } from "react";
import { itemSpriteUrl } from "../lib/sprites";

interface Props {
  /** slug da PokeAPI; ausente para itens sem sprite (GS Ball, mascaras…). */
  apiSlug: string | undefined;
  name: string;
  /** Glifo desenhado usado quando nao existe sprite. */
  fallback: string;
}

/**
 * Sprite oficial do item, servido de `public/sprites/items/`. Itens que a
 * PokeAPI ainda nao ilustrou caem no emblema da categoria — inclusive se o
 * arquivo faltar em disco, via onError.
 */
const ItemSprite = ({ apiSlug, name, fallback }: Props) => {
  const [broken, setBroken] = useState(false);
  const src = apiSlug && !broken ? itemSpriteUrl(apiSlug) : "";

  if (!src) {
    return (
      <div className="item-emblem" aria-hidden="true">
        {fallback}
      </div>
    );
  }

  return (
    <div className="item-emblem item-emblem-sprite">
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        width={48}
        height={48}
        onError={() => setBroken(true)}
      />
    </div>
  );
};

export default ItemSprite;
