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
}

/** Sprite pequeno com legenda. Usado no treinador e na página de habilidade. */
const PokemonMini = ({ id, label, sub, slug }: Props) => {
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
  return slug ? (
    <Link to={`/pokemon/${slug}`} className="poke-mini">
      {conteudo}
    </Link>
  ) : (
    <span className="poke-mini">{conteudo}</span>
  );
};

export default PokemonMini;
