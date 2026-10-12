import { useContext } from "react";
import { Link } from "react-router-dom";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import RosterList from "../components/device/RosterList";
import FavoriteContext from "../contexts/favoritesContext";
import { useFavoritePokemons } from "../hooks/usePokemon";
import { pixelSpriteUrl } from "../lib/sprites";
import { pokemonLabel } from "../lib/pokemonLabel";
import { useLang, tr } from "../i18n/lang";
import "../styles/favorites.css";

const BARRAS = [
  { slug: "hp", pt: "PS", en: "HP" },
  { slug: "attack", pt: "ATK", en: "ATK" },
  { slug: "defense", pt: "DEF", en: "DEF" },
] as const;

/**
 * Favoritos: a coleção.
 *
 * À esquerda a lista (tocar tira da coleção); à direita as fichas, que abrem
 * o pokémon na Pokédex.
 */
const FavoritesPage = () => {
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const { pokemons, isLoading } = useFavoritePokemons(favoritePokemons);
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const n = favoritePokemons.length;

  useDevicePage({ labels: [t("COLECAO", "COLLECTION"), t("FICHAS", "CARDS")] });

  return (
    <Panes
      leftLabel={t("Coleção", "Collection")}
      rightLabel={t("Fichas", "Cards")}
      left={
        <>
          <div className="pane-bar">
            <h2 className="pane-h">{t("COLECAO", "COLLECTION")}</h2>
            <p className="fav-hint">{t("Toque para tirar da coleção.", "Tap to remove from the collection.")}</p>
          </div>
          <RosterList
            names={favoritePokemons}
            onPick={updateFavoritePokemons}
            mark={() => "♥"}
            emptyText={t("NENHUM POKEMON NA SUA COLECAO AINDA", "NO POKEMON IN YOUR COLLECTION YET")}
          />
        </>
      }
      right={
        <>
          <header className="pane-band">
            <span className="px">{t("SUA COLECAO", "YOUR COLLECTION")}</span>
            <h2>
              {n} {n === 1 ? t("carta", "card") : t("cartas", "cards")}
            </h2>
          </header>
          <div className="pane-scroll pane-scroll-loose">
            {n === 0 ? (
              <p className="pane-empty">
                {t("NENHUM POKEMON NA SUA COLECAO AINDA", "NO POKEMON IN YOUR COLLECTION YET")}
                <br />
                <Link to="/">{t("EXPLORAR A POKEDEX →", "EXPLORE THE POKEDEX →")}</Link>
              </p>
            ) : isLoading && pokemons.length === 0 ? (
              <p className="pane-empty">{t("CARREGANDO…", "LOADING…")}</p>
            ) : (
              <ul className="fav-grid">
                {pokemons.map((p) => (
                  <li key={p.id}>
                    <Link to={`/pokemon/${p.name}`} className="fav-card">
                      <span className="fav-card-sprite">
                        <img className="pixelated" src={pixelSpriteUrl(p.id)} width={112} height={112} alt="" loading="lazy" />
                      </span>
                      <strong>{pokemonLabel(p.name, lang)}</strong>
                      <span className="fav-card-types">
                        {p.types.map((x) => (
                          <span key={x.type.name} className="type-dot" style={{ background: `var(--t-${x.type.name})` }} />
                        ))}
                      </span>
                      <span className="fav-card-stats">
                        {BARRAS.map((b) => {
                          const v = p.stats.find((s) => s.stat.name === b.slug)?.base_stat ?? 0;
                          return (
                            <span key={b.slug}>
                              <span className="px">{lang === "en" ? b.en : b.pt}</span>
                              <span className="fav-card-bar">
                                <span style={{ width: `${Math.min(100, (v / 180) * 100)}%` }} />
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      }
    />
  );
};

export default FavoritesPage;
