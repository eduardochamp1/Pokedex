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
import { pokemonLabel } from "../lib/pokemonLabel";

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
      {/* O nome já aparece na carta, mas como texto de carta; o título da
          página para leitor de tela é este. */}
      <h1 className="visually-hidden">{pokemonLabel(pokemon.name)}</h1>
      <button
        type="button"
        className="detail-close"
        onClick={goBack}
        aria-label={t("Fechar", "Close")}
      >
        ✕
      </button>

      <div className="detail-layout">
        <section className="detail-panel detail-panel-sprites">
          <h2>Sprites</h2>
          <SpriteViewer pokemon={pokemon} onSelect={setSpriteOverride} />
        </section>

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
          <section className="detail-panel detail-panel-forms">
            <h2>{t("Formas", "Forms")}</h2>
            <VarietySwitcher
              varieties={species.data.varieties}
              currentName={pokemon.name}
            />
          </section>
        )}

        <section className="detail-panel detail-panel-evo">
          <h2>{t("Evoluções", "Evolutions")}</h2>
          {evolution.isLoading ? (
            <p className="detail-muted">{t("Carregando…", "Loading…")}</p>
          ) : (
            <EvolutionChain
              steps={evolution.data ?? []}
              currentName={pokemon.name}
            />
          )}
        </section>

        {species.data && (
          <section className="detail-panel detail-panel-lore">
            <h2>{t("Sobre", "About")}</h2>
            <PokemonLore species={species.data} />
          </section>
        )}

        <section className="detail-panel detail-panel-meta">
          <h2>{t("Ficha", "Profile")}</h2>
          <PokemonMeta pokemon={pokemon} species={species.data} />
        </section>

        <section className="detail-panel detail-panel-defense">
          <h2>{t("Defesas", "Defenses")}</h2>
          <TypeDefense types={pokemon.types.map((t) => t.type.name)} />
        </section>

        <section className="detail-panel detail-panel-abilities">
          <h2>{t("Habilidades", "Abilities")}</h2>
          <AbilityList abilities={pokemon.abilities} />
        </section>

        <section className="detail-panel detail-panel-moves">
          <h2>{t("Golpes", "Moves")}</h2>
          <MoveList moves={pokemon.moves ?? []} />
        </section>

        <section className="detail-panel detail-panel-encounters">
          <h2>{t("Onde encontrar", "Where to find")}</h2>
          <EncounterPanel pokemonId={pokemon.id} />
        </section>

        {species.data && (
          <section className="detail-panel detail-panel-capture">
            <h2>{t("Chance de captura", "Catch chance")}</h2>
            <CapturePanel
              national={pokemon.id}
              captureRate={species.data.capture_rate}
              baseHp={pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 1}
              types={pokemon.types.map((t) => t.type.name)}
            />
          </section>
        )}

        <section className="detail-panel detail-panel-scrubber">
          <h2>{t("Sprite através das gerações", "Sprite across generations")}</h2>
          <SpriteScrubber pokemon={pokemon} />
        </section>

        <section className="detail-panel detail-panel-stats">
          <h2>{t("Status base", "Base stats")}</h2>
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
        </section>
      </div>
    </div>
  );
};

export default DetailPage;
