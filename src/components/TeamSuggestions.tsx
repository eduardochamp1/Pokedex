import { useState } from "react";
import { POKEMON_TYPES, useTypeLists } from "../hooks/usePokemon";
import { speciesForCombo, suggestTypes } from "../lib/teamSuggest";
import type { TeamMember } from "../lib/teamAnalysis";
import { tType } from "../data/i18n";
import { pokemonLabel } from "../lib/pokemonLabel";
import { pixelSpriteUrl } from "../lib/sprites";
import { useLang, tr } from "../i18n/lang";

interface Props {
  membros: TeamMember[];
  /** Nome -> id da dex, do índice da PokéAPI. */
  index: Map<string, number> | undefined;
  onAdd: (name: string) => void;
}

/** Quantas combinações mostrar, e quantas espécies em cada uma. */
const COMBINACOES = 3;
const POR_COMBINACAO = 8;
const DEX_DA_GEN_3 = 386;

/**
 * Que tipo de pokémon consertaria o time, com espécies daquele tipo para
 * adicionar num clique.
 */
const TeamSuggestions = ({ membros, index, onAdd }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [soGen3, setSoGen3] = useState(false);
  const sugestoes = suggestTypes(membros, COMBINACOES);

  // Combinação dupla precisa das duas listas; tipo simples precisa de todas,
  // para saber quem NÃO tem segundo tipo.
  const tipos = sugestoes.some((s) => s.types.length === 1)
    ? [...POKEMON_TYPES]
    : [...new Set(sugestoes.flatMap((s) => s.types))];
  const listas = useTypeLists(tipos);
  const carregando = tipos.some((ty) => !listas[ty]);
  const noTime = new Set(membros.map((m) => m.name));

  if (sugestoes.length === 0) return null;

  return (
    <section aria-labelledby="team-sugestoes">
      <h2 id="team-sugestoes">{t("Quem consertaria o time", "Who would fix the team")}</h2>
      <label className="team-sugestoes-filtro">
        <input type="checkbox" checked={soGen3} onChange={(e) => setSoGen3(e.target.checked)} />{" "}
        {t("Só até a Gen 3 (#386)", "Up to Gen 3 only (#386)")}
      </label>
      <ol className="team-sugestoes">
        {sugestoes.map((s) => {
          const especies = index
            ? speciesForCombo(s.types, listas, index, soGen3 ? DEX_DA_GEN_3 : Infinity).filter((n) => !noTime.has(n))
            : [];
          return (
            <li key={s.types.join("-")} className="team-sugestao">
              <p className="team-sugestao-tipos">
                {s.types.map((ty) => (
                  <span key={ty} className="card-type-dot card-type-dot-lg" data-type={ty}>
                    {tType(ty)}
                  </span>
                ))}
              </p>
              <ul className="team-sugestao-porque">
                {s.fixes.length > 0 && (
                  <li>
                    {t("Aguenta", "Takes")} {s.fixes.map((f) => tType(f)).join(", ")}
                  </li>
                )}
                {s.covers.length > 0 && (
                  <li>
                    {t("Acerta forte", "Hits hard")} {s.covers.map((c) => tType(c)).join(", ")}
                  </li>
                )}
                {s.worsens.length > 0 && (
                  <li className="team-sugestao-custo">
                    {t("Mas soma fraqueza a", "But adds weakness to")} {s.worsens.map((w) => tType(w)).join(", ")}
                  </li>
                )}
              </ul>
              {carregando ? (
                <p className="team-sugestao-vazio">{t("Buscando espécies…", "Finding species…")}</p>
              ) : especies.length === 0 ? (
                <p className="team-sugestao-vazio">
                  {t("Nenhuma espécie com essa combinação.", "No species with this combination.")}
                </p>
              ) : (
                <ul className="team-sugestao-especies">
                  {especies.slice(0, POR_COMBINACAO).map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => onAdd(n)}
                        disabled={membros.length >= 6}
                        title={t(`Adicionar ${pokemonLabel(n)} ao time`, `Add ${pokemonLabel(n)} to the team`)}
                      >
                        <img src={pixelSpriteUrl(index?.get(n) ?? 0)} alt="" width={40} height={40} loading="lazy" />
                        <span>{pokemonLabel(n)}</span>
                      </button>
                    </li>
                  ))}
                  {especies.length > POR_COMBINACAO && (
                    <li className="team-sugestao-vazio">
                      {t(`+${especies.length - POR_COMBINACAO}`, `+${especies.length - POR_COMBINACAO}`)}
                    </li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default TeamSuggestions;
