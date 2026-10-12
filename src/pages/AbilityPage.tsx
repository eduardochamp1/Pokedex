import { usePtAbilities } from "../i18n/ptData";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchJsonPublic } from "../api";
import PokemonMini from "../components/PokemonMini";
import { abilityHolders } from "../lib/abilityHolders";
import { pickLocalized } from "../lib/localize";
import { pokemonLabel } from "../lib/pokemonLabel";
import { generationNumberFromName } from "../lib/regionForPokemon";
import type { AbilityDetail } from "../types/pokemon";
import "../styles/ability.css";
import { useLang, tr } from "../i18n/lang";
import { generationLabel } from "../i18n/common";

const HOUR = 60 * 60 * 1000;

const humanize = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Todos os pokémon com uma habilidade. A queryKey é a mesma de
 * `useAbilities`: quem chega pela ficha já tem a resposta em cache.
 */
const AbilityPage = () => {
  const pt = usePtAbilities();
  const { slug = "" } = useParams<{ slug: string }>();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { data, isLoading, isError } = useQuery<AbilityDetail | null>({
    queryKey: ["ability", slug],
    queryFn: ({ signal }) =>
      fetchJsonPublic<AbilityDetail>(`https://pokeapi.co/api/v2/ability/${slug}`, signal),
    enabled: Boolean(slug),
    staleTime: HOUR,
    gcTime: HOUR,
  });

  if (isLoading) {
    return (
      <div className="ability-shell">
        <p className="detail-muted">{t("Carregando…", "Loading…")}</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="ability-shell">
        <h1>{t("Habilidade", "Ability")}</h1>
        <p className="detail-muted">
          {isError
            ? t("Não foi possível consultar a PokéAPI.", "Couldn't reach the PokéAPI.")
            : t(`Não existe habilidade "${slug}".`, `There is no ability "${slug}".`)}
        </p>
      </div>
    );
  }

  const original = pickLocalized(data.names, (n) => n.name) || humanize(data.name);
  const traduzida = pt?.[data.name];
  const nome = traduzida?.name ?? original;
  const curto = traduzida?.short ?? pickLocalized(data.effect_entries, (e) => e.short_effect);
  const longo = traduzida ? traduzida.effect ?? traduzida.short : pickLocalized(data.effect_entries, (e) => e.effect);
  // O texto de sabor do jogo só existe em inglês na PokéAPI; em português sai
  // o traduzido, e nunca o original, para não misturar os idiomas.
  const flavor = traduzida ? traduzida.flavor ?? "" : pickLocalized(data.flavor_text_entries, (f) => f.flavor_text);
  const geracao = data.generation ? generationNumberFromName(data.generation.name) : undefined;
  const { regular, hidden } = abilityHolders(data);

  const grade = (lista: typeof regular) => (
    <div className="ability-grade">
      {lista.map((h) => (
        <PokemonMini key={h.name} id={h.id} label={pokemonLabel(h.name)} slug={h.name} />
      ))}
    </div>
  );

  return (
    <div className="ability-shell">
      <header className="ability-header">
        <h1>{nome}</h1>
        {nome !== original && (
          <span className="nome-original" lang="en">
            {original}
          </span>
        )}
        {geracao && (
          <span className="ability-gen">
            {t("desde a", "since")}{" "}
            <Link to="/lore?aba=generations">{generationLabel(geracao, lang)}</Link>
          </span>
        )}
      </header>

      <section className="ability-texto">
        {curto && <p className="ability-curto">{curto}</p>}
        {longo && longo !== curto && <p>{longo}</p>}
        {flavor && <p className="ability-flavor">“{flavor}”</p>}
      </section>

      <section>
        <h2>
          {t("Comum", "Regular")} <span className="ability-conta">{regular.length}</span>
        </h2>
        {regular.length ? grade(regular) : <p className="detail-muted">{t("Nenhum.", "None.")}</p>}
      </section>

      {hidden.length > 0 && (
        <section>
          <h2>
            {t("Oculta", "Hidden")} <span className="ability-conta">{hidden.length}</span>
          </h2>
          {grade(hidden)}
        </section>
      )}
    </div>
  );
};

export default AbilityPage;
