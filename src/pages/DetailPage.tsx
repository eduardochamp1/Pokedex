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
import MoveList from "../components/MoveList";
import CryButton from "../components/CryButton";
import EncounterPanel from "../components/EncounterPanel";
import CapturePanel from "../components/CapturePanel";
import "../styles/detailExtras.css";
import { DetailSkeleton } from "../components/Skeleton";
import { useLang, tr } from "../i18n/lang";
import { statLabel } from "../i18n/common";

const DetailPage = () => {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
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
        <p>{t("Não foi possível carregar este pokémon. Tente de novo.", "Couldn't load this Pokémon. Try again.")}</p>
        <Link to="/">{t("← Voltar para a Pokédex", "← Back to the Pokédex")}</Link>
      </div>
    );
  }
  if (!pokemon) {
    return (
      <div className="detail-shell">
        <p>{t("Pokémon não encontrado.", "Pokémon not found.")}</p>
        <Link to="/">{t("← Voltar para a Pokédex", "← Back to the Pokédex")}</Link>
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
        aria-label={t("Fechar", "Close")}
      >
        ✕
      </button>

      <div className="detail-layout">
        <aside className="detail-panel detail-panel-sprites">
          <h3>Sprites</h3>
          <SpriteViewer pokemon={pokemon} onSelect={setSpriteOverride} />
        </aside>

        <div className="detail-hero-slot">
          <CardHero
            pokemon={pokemon}
            spriteUrl={spriteOverride}
            viewTransitionName="card-flip"
          />
          <div className="detail-hero-actions">
            <button
              type="button"
              className="detail-fav-btn"
              onClick={() => updateFavoritePokemons(pokemon.name)}
            >
              {isFav ? t("♥ Nos favoritos", "♥ In favorites") : t("♡ Favoritar", "♡ Favorite")}
            </button>
            <CryButton src={pokemon.cries?.latest} name={pokemon.name} />
          </div>
        </div>

        {species.data && species.data.varieties.length > 1 && (
          <aside className="detail-panel detail-panel-forms">
            <h3>{t("Formas", "Forms")}</h3>
            <VarietySwitcher
              varieties={species.data.varieties}
              currentName={pokemon.name}
            />
          </aside>
        )}

        <aside className="detail-panel detail-panel-evo">
          <h3>{t("Evoluções", "Evolutions")}</h3>
          {evolution.isLoading ? (
            <p className="detail-muted">{t("Carregando…", "Loading…")}</p>
          ) : (
            <EvolutionChain
              steps={evolution.data ?? []}
              currentName={pokemon.name}
            />
          )}
        </aside>

        {species.data && (
          <aside className="detail-panel detail-panel-lore">
            <h3>{t("Sobre", "About")}</h3>
            <PokemonLore species={species.data} />
          </aside>
        )}

        <aside className="detail-panel detail-panel-meta">
          <h3>{t("Ficha", "Profile")}</h3>
          <PokemonMeta pokemon={pokemon} species={species.data} />
        </aside>

        <aside className="detail-panel detail-panel-defense">
          <h3>{t("Defesas", "Defenses")}</h3>
          <TypeDefense types={pokemon.types.map((t) => t.type.name)} />
        </aside>

        <aside className="detail-panel detail-panel-abilities">
          <h3>{t("Habilidades", "Abilities")}</h3>
          <AbilityList abilities={pokemon.abilities} />
        </aside>

        <aside className="detail-panel detail-panel-moves">
          <h3>{t("Golpes", "Moves")}</h3>
          <MoveList moves={pokemon.moves ?? []} />
        </aside>

        <aside className="detail-panel detail-panel-encounters">
          <h3>{t("Onde encontrar", "Where to find")}</h3>
          <EncounterPanel pokemonId={pokemon.id} />
        </aside>

        {species.data && (
          <aside className="detail-panel detail-panel-capture">
            <h3>{t("Chance de captura", "Catch chance")}</h3>
            <CapturePanel
              national={pokemon.id}
              captureRate={species.data.capture_rate}
              baseHp={pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 1}
              types={pokemon.types.map((t) => t.type.name)}
            />
          </aside>
        )}

        <aside className="detail-panel detail-panel-scrubber">
          <h3>{t("Sprite através das gerações", "Sprite across generations")}</h3>
          <SpriteScrubber pokemon={pokemon} />
        </aside>

        <aside className="detail-panel detail-panel-stats">
          <h3>{t("Status base", "Base stats")}</h3>
          <ul className="detail-stats">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                <span className="detail-stat-label">
                  {statLabel(s.stat.name, lang)}
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
