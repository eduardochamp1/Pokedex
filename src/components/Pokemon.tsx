import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import type { Pokemon as PokemonT } from "../types/pokemon";

interface Props {
  pokemon: PokemonT;
}

const Pokemon = ({ pokemon }: Props) => {
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const isFavorite = favoritePokemons.includes(pokemon.name);
  const heart = isFavorite ? "❤️" : "🖤";

  return (
    <div className="pokemon-card">
      <Link to={`/pokemon/${pokemon.name}`} className="pokemon-image-container">
        <img
          src={pokemon.sprites.front_default ?? ""}
          alt={pokemon.name}
          className="pokemon-image"
        />
      </Link>
      <div className="card-body">
        <div className="card-top">
          <Link to={`/pokemon/${pokemon.name}`} className="pokemon-name-link">
            <h3>{pokemon.name}</h3>
          </Link>
          <div>#{pokemon.id}</div>
        </div>
        <div className="card-bottom">
          <div className="pokemon-type">
            {pokemon.types.map((type) => (
              <div
                key={type.type.name}
                className="pokemon-type-text"
                data-type={type.type.name}
              >
                {type.type.name}
              </div>
            ))}
            <button
              className="pokemon-heart-btn"
              onClick={() => updateFavoritePokemons(pokemon.name)}
              aria-label={
                isFavorite
                  ? `Remover ${pokemon.name} dos favoritos`
                  : `Adicionar ${pokemon.name} aos favoritos`
              }
            >
              {heart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pokemon;
