import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useFavoritePokemons } from "../hooks/usePokemon";
import Card from "../components/Card";

const FavoritesPage = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  const { pokemons, isLoading } = useFavoritePokemons(favoritePokemons);

  if (favoritePokemons.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="favorites-empty-ghost" aria-hidden="true">?</div>
        <p>Nenhuma carta na sua coleção ainda.</p>
        <Link to="/" className="favorites-empty-cta">
          Explorar Pokédex →
        </Link>
      </div>
    );
  }

  return (
    <div className="favorites-shell">
      <header className="favorites-header">
        <h1>Sua coleção</h1>
        <span className="favorites-count">
          {favoritePokemons.length}{" "}
          {favoritePokemons.length === 1 ? "carta" : "cartas"}
        </span>
      </header>
      {isLoading && pokemons.length === 0 ? (
        <p>Carregando…</p>
      ) : (
        <div className="favorites-grid">
          {pokemons.map((p, idx) => (
            <div key={p.id} className="favorites-item">
              <Card pokemon={p} linkTo={`/pokemon/${p.name}`} />
              <span className="favorites-stamp">#{idx + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
