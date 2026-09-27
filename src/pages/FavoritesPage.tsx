import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import { useFavoritePokemons } from "../hooks/usePokemon";
import Card from "../components/Card";
import { useT } from "../i18n/lang";

const FavoritesPage = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  const { pokemons, isLoading } = useFavoritePokemons(favoritePokemons);
  const t = useT();

  if (favoritePokemons.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="favorites-empty-ghost" aria-hidden="true">?</div>
        <p>{t("Nenhuma carta na sua coleção ainda.", "No cards in your collection yet.")}</p>
        <Link to="/" className="favorites-empty-cta">
          {t("Explorar Pokédex →", "Explore the Pokédex →")}
        </Link>
      </div>
    );
  }

  return (
    <div className="favorites-shell">
      <header className="favorites-header">
        <h1>{t("Sua coleção", "Your collection")}</h1>
        <span className="favorites-count">
          {favoritePokemons.length}{" "}
          {favoritePokemons.length === 1 ? t("carta", "card") : t("cartas", "cards")}
        </span>
      </header>
      {isLoading && pokemons.length === 0 ? (
        <p>{t("Carregando…", "Loading…")}</p>
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
