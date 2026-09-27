import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import ScanlineToggle from "./ScanlineToggle";
import { openSearch } from "../lib/searchEvents";
import { InstallButton } from "./AppStatus";
import LangToggle from "./LangToggle";
import { usePausedGame } from "../emulator/usePausedGame";

const Navbar = () => {
  const { favoritePokemons } = useContext(FavoriteContext);
  // Sair de /jogar pausa o jogo, e ate aqui nenhuma tela dizia isso.
  const pausado = usePausedGame();
  return (
    <nav className="navbar">
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
          to="/time"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Time
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
          to="/jogar"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " nav-link-active" : "")
          }
        >
          Jogar
          {pausado && (
            <span
              className="nav-paused"
              title={`${pausado} está pausado`}
              aria-label={`${pausado} está pausado`}
            >
              <span aria-hidden="true">❚❚</span>
            </span>
          )}
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
          <span className="nav-link-full">Tamanhos</span>
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
          <span className="nav-link-full">Favoritos</span>
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
        aria-label="Buscar no site (Ctrl+K)"
        title="Buscar no site (Ctrl+K)"
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
