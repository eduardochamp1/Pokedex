import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useFavoritePokemons } from "../hooks/usePokemon";
import Pokemon from "../components/Pokemon";

const FavoritesPage = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  const { pokemons, isLoading } = useFavoritePokemons(favoritePokemons);

  if (favoritePokemons.length === 0) {
    return (
      <div className="empty-state">
        <p>Você ainda não favoritou nenhum pokémon.</p>
        <Link to="/">Ir para a Pokédex →</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="pokedex-header">
        <h1>Favoritos</h1>
        <div>{favoritePokemons.length} ❤️</div>
      </div>
      {isLoading && pokemons.length === 0 ? (
        <div>Carregando…</div>
      ) : (
        <div className="pokedex-grid">
          {pokemons.map((p) => (
            <Pokemon key={p.id} pokemon={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
