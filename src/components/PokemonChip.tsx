import { useState } from "react";
import { Link } from "react-router-dom";
import { pixelSpriteUrl } from "../lib/sprites";

interface Props {
  name: string;
  /** id da Pokedex, vindo do indice global — dispensa buscar o detalhe. */
  id?: number;
  onFilter?: () => void;
}

const PokemonChip = ({ name, id, onFilter }: Props) => {
  const [broken, setBroken] = useState(false);
  const sprite = broken ? "" : pixelSpriteUrl(id);

  return (
    <span className="lore-chip-wrap">
      <Link to={`/pokemon/${name}`} className="lore-chip" title={name}>
        {sprite ? (
          <img
            src={sprite}
            alt={name}
            loading="lazy"
            decoding="async"
            width={48}
            height={48}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="lore-chip-placeholder">?</span>
        )}
        <span>{name}</span>
      </Link>
      {onFilter && (
        <button
          type="button"
          className="lore-chip-filter"
          onClick={onFilter}
          title={`Ver todos os registros com ${name}`}
          aria-label={`Filtrar por ${name}`}
        >
          ⚲
        </button>
      )}
    </span>
  );
};

export default PokemonChip;
