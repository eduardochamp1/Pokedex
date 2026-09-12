import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import FavoriteContext from "../contexts/favoritesContext";
import CardHero from "../components/CardHero";
import EvolutionChain from "../components/EvolutionChain";
import SpriteViewer from "../components/SpriteViewer";
import SpriteScrubber from "../components/SpriteScrubber";
import VarietySwitcher from "../components/VarietySwitcher";
import PokemonLore from "../components/PokemonLore";
import PokemonMeta from "../components/PokemonMeta";
import TypeDefense from "../components/TypeDefense";
import AbilityList from "../components/AbilityList";
import CryButton from "../components/CryButton";
import { DetailSkeleton } from "../components/Skeleton";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atq",
  defense: "Def",
  "special-attack": "Atq Esp",
  "special-defense": "Def Esp",
  speed: "Vel",
};

const DetailPage = () => {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: pokemon, isLoading, isError } = usePokemonDetail(nameOrId);
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const species = usePokemonSpecies(pokemon?.species.url);
  const evolution = useEvolutionChain(pokemon?.species.url);
  const [spriteOverride, setSpriteOverride] = useState<string | undefined>();

  useEffect(() => setSpriteOverride(undefined), [pokemon?.id]);

  // Em deep link / F5 nao existe entrada anterior no historico: voltar com
  // navigate(-1) sairia do app, entao caimos na Home.
  const goBack = useCallback(() => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  }, [location.key, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack]);

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    return (
      <div className="detail-shell">
        <p>Não foi possível carregar este pokémon. Tente de novo.</p>
        <Link to="/">← Voltar para a Pokédex</Link>
      </div>
    );
  }
  if (!pokemon) {
    return (
      <div className="detail-shell">
        <p>Pokémon não encontrado.</p>
        <Link to="/">← Voltar para a Pokédex</Link>
      </div>
    );
  }

  const isFav = favoritePokemons.includes(pokemon.name);
  const total = pokemon.stats.reduce((s, x) => s + x.base_stat, 0);

  return (
    <div className="detail-shell" data-primary-type={pokemon.types[0]?.type.name}>
      <button
        type="button"
        className="detail-close"
        onClick={goBack}
        aria-label="Fechar"
      >
        ✕
      </button>

      <div className="detail-layout">
        <aside className="detail-panel detail-panel-sprites">
          <h3>Sprites</h3>
          <SpriteViewer pokemon={pokemon} onSelect={setSpriteOverride} />
        </aside>

        <div className="detail-hero-slot">
          <CardHero pokemon={pokemon} spriteUrl={spriteOverride} />
          <div className="detail-hero-actions">
            <button
              type="button"
              className="detail-fav-btn"
              onClick={() => updateFavoritePokemons(pokemon.name)}
            >
              {isFav ? "❤️ Nos favoritos" : "🖤 Favoritar"}
            </button>
            <CryButton src={pokemon.cries?.latest} name={pokemon.name} />
          </div>
        </div>

        {species.data && species.data.varieties.length > 1 && (
          <aside className="detail-panel detail-panel-forms">
            <h3>Formas</h3>
            <VarietySwitcher
              varieties={species.data.varieties}
              currentName={pokemon.name}
            />
          </aside>
        )}

        <aside className="detail-panel detail-panel-evo">
          <h3>Evoluções</h3>
          {evolution.isLoading ? (
            <p className="detail-muted">Carregando…</p>
          ) : (
            <EvolutionChain
              steps={evolution.data ?? []}
              currentName={pokemon.name}
            />
          )}
        </aside>

        {species.data && (
          <aside className="detail-panel detail-panel-lore">
            <h3>Sobre</h3>
            <PokemonLore species={species.data} />
          </aside>
        )}

        <aside className="detail-panel detail-panel-meta">
          <h3>Ficha</h3>
          <PokemonMeta pokemon={pokemon} species={species.data} />
        </aside>

        <aside className="detail-panel detail-panel-defense">
          <h3>Defesas</h3>
          <TypeDefense types={pokemon.types.map((t) => t.type.name)} />
        </aside>

        <aside className="detail-panel detail-panel-abilities">
          <h3>Habilidades</h3>
          <AbilityList abilities={pokemon.abilities} />
        </aside>

        <aside className="detail-panel detail-panel-scrubber">
          <h3>Sprite através das gerações</h3>
          <SpriteScrubber pokemon={pokemon} />
        </aside>

        <aside className="detail-panel detail-panel-stats">
          <h3>Status base</h3>
          <ul className="detail-stats">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                <span className="detail-stat-label">
                  {STAT_LABELS[s.stat.name] ?? s.stat.name}
                </span>
                <span className="detail-stat-bar">
                  <span
                    className="detail-stat-fill"
                    style={{
                      width: `${Math.min(100, (s.base_stat / 200) * 100)}%`,
                    }}
                  />
                </span>
                <span className="detail-stat-value">{s.base_stat}</span>
              </li>
            ))}
            <li className="detail-stat-total">
              <span>Total</span>
              <span></span>
              <span>{total}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DetailPage;
