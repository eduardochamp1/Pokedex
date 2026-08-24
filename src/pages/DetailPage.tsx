import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
} from "../hooks/usePokemon";
import FavoriteContext from "../contexts/favoritesContext";
import EvolutionChain from "../components/EvolutionChain";
import SpriteViewer from "../components/SpriteViewer";
import VarietySwitcher from "../components/VarietySwitcher";
import PokemonLore from "../components/PokemonLore";
import { DetailSkeleton } from "../components/Skeleton";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Atq. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidade",
};

const DetailPage = () => {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const { data: pokemon, isLoading, isError } = usePokemonDetail(nameOrId);
  const { favoritePokemons, updateFavoritePokemons } = useContext(FavoriteContext);
  const species = usePokemonSpecies(pokemon?.species.url);
  const evolution = useEvolutionChain(pokemon?.species.url);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !pokemon) {
    return (
      <div className="detail-container">
        <p>Pokémon não encontrado.</p>
        <Link to="/">← Voltar</Link>
      </div>
    );
  }

  const isFavorite = favoritePokemons.includes(pokemon.name);

  return (
    <div className="detail-container">
      <div className="detail-header">
        <Link to="/" className="detail-back">
          ← Voltar
        </Link>
        <button
          className="pokemon-heart-btn detail-heart"
          onClick={() => updateFavoritePokemons(pokemon.name)}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {isFavorite ? "❤️" : "🖤"}
        </button>
      </div>

      <div className="detail-hero" data-primary-type={pokemon.types[0]?.type.name}>
        <SpriteViewer pokemon={pokemon} />
        <div>
          <h1 className="detail-name">{pokemon.name}</h1>
          <div className="detail-id">#{String(pokemon.id).padStart(3, "0")}</div>
          <div className="pokemon-type">
            {pokemon.types.map((t) => (
              <div
                key={t.type.name}
                className="pokemon-type-text"
                data-type={t.type.name}
              >
                {t.type.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {species.data && (
        <section className="detail-section">
          <h2>Sobre</h2>
          <PokemonLore species={species.data} />
        </section>
      )}

      {species.data && species.data.varieties.length > 1 && (
        <section className="detail-section">
          <h2>Formas</h2>
          <VarietySwitcher
            varieties={species.data.varieties}
            currentName={pokemon.name}
          />
        </section>
      )}

      <section className="detail-section">
        <h2>Informações</h2>
        <ul className="detail-meta">
          <li>
            <strong>Altura:</strong> {(pokemon.height / 10).toFixed(1)} m
          </li>
          <li>
            <strong>Peso:</strong> {(pokemon.weight / 10).toFixed(1)} kg
          </li>
          <li>
            <strong>Habilidades:</strong>{" "}
            {pokemon.abilities.map((a) => a.ability.name).join(", ")}
          </li>
        </ul>
      </section>

      <section className="detail-section">
        <h2>Status base</h2>
        <ul className="detail-stats">
          {pokemon.stats.map((s) => {
            const label = STAT_LABELS[s.stat.name] ?? s.stat.name;
            const pct = Math.min(100, (s.base_stat / 200) * 100);
            return (
              <li key={s.stat.name} className="detail-stat">
                <span className="detail-stat-label">{label}</span>
                <span className="detail-stat-value">{s.base_stat}</span>
                <span className="detail-stat-bar">
                  <span
                    className="detail-stat-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="detail-section">
        <h2>Evoluções</h2>
        {evolution.isLoading ? (
          <p>Carregando evoluções…</p>
        ) : (
          <EvolutionChain names={evolution.data ?? []} currentName={pokemon.name} />
        )}
      </section>
    </div>
  );
};

export default DetailPage;
