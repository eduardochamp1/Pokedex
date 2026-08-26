import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import FavoriteContext from "../contexts/favoritesContext";
import CardHero from "../components/CardHero";
import EvolutionChain from "../components/EvolutionChain";
import SpriteViewer from "../components/SpriteViewer";
import VarietySwitcher from "../components/VarietySwitcher";
import PokemonLore from "../components/PokemonLore";
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
  const { data: pokemon, isLoading, isError } = usePokemonDetail(nameOrId);
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const species = usePokemonSpecies(pokemon?.species.url);
  const evolution = useEvolutionChain(pokemon?.species.url);
  const [spriteOverride, setSpriteOverride] = useState<string | undefined>();

  useEffect(() => setSpriteOverride(undefined), [pokemon?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !pokemon) {
    return (
      <div className="detail-shell">
        <p>Pokémon não encontrado.</p>
        <Link to="/">← Voltar</Link>
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
        onClick={() => navigate(-1)}
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
          <button
            type="button"
            className="detail-fav-btn"
            onClick={() => updateFavoritePokemons(pokemon.name)}
          >
            {isFav ? "❤️ Nos favoritos" : "🖤 Favoritar"}
          </button>
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
              names={evolution.data ?? []}
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
