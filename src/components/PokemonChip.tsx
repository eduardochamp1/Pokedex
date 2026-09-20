import { useState } from "react";
import { Link } from "react-router-dom";
import { pixelSpriteUrl } from "../lib/sprites";
import { pokemonLabel } from "../lib/pokemonLabel";

interface Props {
  name: string;
  /** id da Pokedex, vindo do indice global — dispensa buscar o detalhe. */
  id?: number;
  onFilter?: () => void;
}

const PokemonChip = ({ name, id, onFilter }: Props) => {
  const [broken, setBroken] = useState(false);
  const sprite = broken ? "" : pixelSpriteUrl(id);
  // O slug vai para a rota e para o sprite; o rotulo, para os olhos.
  const rotulo = pokemonLabel(name);

  return (
    <span className="lore-chip-wrap">
      <Link to={`/pokemon/${name}`} className="lore-chip" title={rotulo}>
        {sprite ? (
          <img
            src={sprite}
            alt={rotulo}
            loading="lazy"
            decoding="async"
            width={48}
            height={48}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="lore-chip-placeholder">?</span>
        )}
        <span>{rotulo}</span>
      </Link>
      {onFilter && (
        <button
          type="button"
          className="lore-chip-filter"
          onClick={onFilter}
          title={`Ver todos os registros com ${rotulo}`}
          aria-label={`Filtrar por ${rotulo}`}
        >
          ⚲
        </button>
      )}
    </span>
  );
};

export default PokemonChip;
