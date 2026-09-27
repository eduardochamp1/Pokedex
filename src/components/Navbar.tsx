import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import FavoriteContext from "../contexts/favoritesContext";
import ScanlineToggle from "./ScanlineToggle";
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
      <ScanlineToggle />
    </nav>
  );
};

export default Navbar;
