import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import ScanlineToggle from "./ScanlineToggle";
import { openSearch } from "../lib/searchEvents";
import { InstallButton } from "./AppStatus";
import LangToggle from "./LangToggle";
import { useT } from "../i18n/lang";

const Navbar = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  const t = useT();
  return (
    <nav className="navbar">
      <Link to="/" aria-label={t("Ir para a página inicial", "Go to the home page")} className="navbar-brand">
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
          {t("Comparar", "Compare")}
        </NavLink>
        <NavLink
          to="/time"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          {t("Time", "Team")}
        </NavLink>
        <NavLink
          to="/mapa"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          {t("Mapa", "Map")}
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
          to="/quiz"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Quiz
        </NavLink>
        <NavLink
          to="/tamanhos"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          <span className="nav-link-full">{t("Tamanhos", "Sizes")}</span>
          <span className="nav-link-short" aria-hidden="true">
            📏
          </span>
        </NavLink>
        <NavLink
          to="/favoritos"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          <span className="nav-link-full">{t("Favoritos", "Favorites")}</span>
          <span className="nav-link-short" aria-hidden="true">
            ♥
          </span>
          {favoritePokemons.length > 0 && (
            <span className="nav-count">{favoritePokemons.length}</span>
          )}
        </NavLink>
      </div>
      <button
        type="button"
        className="nav-search"
        onClick={openSearch}
        aria-label={t("Buscar no site (Ctrl+K)", "Search the site (Ctrl+K)")}
        title={t("Buscar no site (Ctrl+K)", "Search the site (Ctrl+K)")}
      >
        <span aria-hidden="true">⌕</span>
        <kbd className="nav-search-kbd">Ctrl K</kbd>
      </button>
      <LangToggle />
      <InstallButton />
      <ScanlineToggle />
    </nav>
  );
};

export default Navbar;
