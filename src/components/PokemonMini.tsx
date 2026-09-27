import { useState } from "react";
import { Link } from "react-router-dom";
import { pixelSpriteUrl } from "../lib/sprites";
import "../styles/pokemonMini.css";

interface Props {
  /** Id da dex; o sprite é local, então não custa request. */
  id: number;
  label: string;
  sub?: string;
  /** Slug da PokéAPI; com ele o mini vira link para a ficha. */
  slug?: string;
  /** Em vez de link, um botão que seleciona (o PC abre a ficha embaixo). */
  onSelect?: () => void;
  selected?: boolean;
}

/** Sprite pequeno com legenda. Usado no treinador e na página de habilidade. */
const PokemonMini = ({ id, label, sub, slug, onSelect, selected }: Props) => {
  const [broken, setBroken] = useState(false);
  const conteudo = (
    <>
      {broken ? (
        <span className="poke-mini-vazio" aria-hidden="true">
          ?
        </span>
      ) : (
        <img
          src={pixelSpriteUrl(id)}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
      <span className="poke-mini-nome">{label}</span>
      {sub && <span className="poke-mini-sub">{sub}</span>}
    </>
  );
  if (onSelect) {
    return (
      <button type="button" className="poke-mini" aria-pressed={selected} onClick={onSelect}>
        {conteudo}
      </button>
    );
  }
  return slug ? (
    <Link to={`/pokemon/${slug}`} className="poke-mini">
      {conteudo}
    </Link>
  ) : (
    <span className="poke-mini">{conteudo}</span>
  );
};

export default PokemonMini;
