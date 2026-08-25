import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";

const Navbar = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  return (
    <nav>
      <Link to="/" aria-label="Ir para a página inicial" className="navbar-brand">
        <span className="navbar-pokeball" aria-hidden="true" />
        <span className="navbar-title">Pokédex</span>
      </Link>
      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Pokédex
        </NavLink>
        <NavLink
          to="/comparar"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Comparar
        </NavLink>
        <NavLink
          to="/mapa"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Mapa
        </NavLink>
        <NavLink
          to="/lore"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Lore
        </NavLink>
        <NavLink
          to="/favoritos"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Favoritos ({favoritePokemons.length})
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
