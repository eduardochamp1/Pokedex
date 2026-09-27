import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EVOLUTION_CHAINS } from "../data/evolutionChains";
import {
  EVO_METHODS,
  buildTree,
  expandDetail,
  filterChains,
  type EvoMethod,
  type TreeNode,
} from "../lib/evolutionTrees";
import { evolutionConditionText } from "../lib/evolution";
import { GEN_RANGES } from "../lib/quiz";
import { usePokemonIndex } from "../hooks/usePokemon";
import { pokemonLabel } from "../lib/pokemonLabel";
import PokemonMini from "../components/PokemonMini";
import { generationLabel } from "../i18n/common";
import { useLang, tr, type Lang } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/evolutions.css";

const ROTULO: Record<EvoMethod, [string, string]> = {
  level: ["Nível", "Level"],
  item: ["Pedra / item", "Stone / item"],
  trade: ["Troca", "Trade"],
  friendship: ["Amizade", "Friendship"],
  held: ["Segurando item", "Held item"],
  move: ["Sabendo golpe", "Knowing a move"],
  location: ["Lugar", "Location"],
  time: ["Hora do dia", "Time of day"],
  other: ["Outros", "Other"],
};

/** Quantas árvores por vez: 340 de uma vez seriam milhares de sprites. */
const LOTE = 30;

/**
 * Todas as árvores de evolução, filtráveis por método, geração, nome e
 * ramificação. O filtro fica na URL (`?metodo=trade&ger=3`).
 */
const EvolutionsPage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [params, setParams] = useSearchParams();
  const metodoParam = params.get("metodo");
  const method = (EVO_METHODS as string[]).includes(metodoParam ?? "") ? (metodoParam as EvoMethod) : "all";
  const genParam = Number(params.get("ger"));
  const gen = Number.isInteger(genParam) && genParam >= 1 && genParam <= GEN_RANGES.length ? genParam : "all";
  const branched = params.get("ramos") === "1";
  const [query, setQuery] = useState("");
  const [mostrar, setMostrar] = useState(LOTE);

  const { index } = usePokemonIndex();
  const slugOf = useMemo(() => {
    const m = new Map<number, string>();
    for (const [name, id] of index ?? []) if (!m.has(id)) m.set(id, name);
    return m;
  }, [index]);
  const slug = useCallback((n: number) => slugOf.get(n) ?? `#${n}`, [slugOf]);

  const lista = useMemo(
    () => filterChains(EVOLUTION_CHAINS, { method, gen, query, branched }, slug),
    [method, gen, query, branched, slug]
  );

  const mudar = (chave: string, valor: string | null) => {
    const p = new URLSearchParams(params);
    if (valor === null) p.delete(chave);
    else p.set(chave, valor);
    setParams(p, { replace: true });
    setMostrar(LOTE);
  };

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Evoluções", "Evolutions")}</h1>
        <span className="trainer-de">
          {lista.length} {t("árvores", "trees")}
        </span>
      </header>

      <p className="trainer-sub">
        {t(
          "Das cadeias da PokéAPI. Quando uma espécie evolui de jeitos diferentes conforme o jogo ou a forma regional, as condições aparecem juntas, separadas por \"ou\" — o Meowth de Alola vira Persian por amizade, o de Kanto por nível.",
          "From the PokéAPI chains. When a species evolves differently depending on the game or regional form, the conditions show together, separated by \"or\" — Alolan Meowth becomes Persian by friendship, Kantonian Meowth by level."
        )}
      </p>

      <div className="evo-filtros">
        <div className="evo-metodos" role="radiogroup" aria-label={t("Método de evolução", "Evolution method")}>
          <button type="button" role="radio" aria-checked={method === "all"} onClick={() => mudar("metodo", null)}>
            {t("Todos", "All")}
          </button>
          {EVO_METHODS.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => mudar("metodo", m)}>
              {lang === "en" ? ROTULO[m][1] : ROTULO[m][0]}
            </button>
          ))}
        </div>
        <div className="evo-linha">
          <label className="evo-busca">
            <span className="visually-hidden">{t("Buscar pokémon", "Search Pokémon")}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setMostrar(LOTE);
              }}
              placeholder={t("Nome de um pokémon da cadeia", "Name of a Pokémon in the chain")}
            />
          </label>
          <label>
            {t("Geração", "Generation")}{" "}
            <select value={String(gen)} onChange={(e) => mudar("ger", e.target.value === "all" ? null : e.target.value)}>
              <option value="all">{t("Todas", "All")}</option>
              {GEN_RANGES.map((_, i) => (
                <option key={i} value={i + 1}>
                  {generationLabel(i + 1, lang)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={branched} onChange={(e) => mudar("ramos", e.target.checked ? "1" : null)} />{" "}
            {t("Só as que se ramificam", "Branching only")}
          </label>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="trainer-vazio">{t("Nenhuma árvore com esse filtro.", "No tree matches this filter.")}</p>
      ) : (
        <ul className="evo-lista">
          {lista.slice(0, mostrar).map((c) => (
            <li key={c.id} className="evo-arvore">
              <No node={buildTree(c)} slug={slug} lang={lang} />
            </li>
          ))}
        </ul>
      )}
      {lista.length > mostrar && (
        <button type="button" className="evo-mais" onClick={() => setMostrar((n) => n + LOTE)}>
          {t(`Mostrar mais (${lista.length - mostrar})`, `Show more (${lista.length - mostrar})`)}
        </button>
      )}
    </div>
  );
};

/** Um nó e, à direita, cada filho com a condição na seta. */
const No = ({ node, slug, lang }: { node: TreeNode; slug: (n: number) => string; lang: Lang }) => {
  const nome = slug(node.id);
  return (
    <div className="evo-no">
      <PokemonMini id={node.id} label={nome.startsWith("#") ? nome : pokemonLabel(nome)} slug={nome.startsWith("#") ? undefined : nome} />
      {node.children.length > 0 && (
        <ul className="evo-filhos">
          {node.children.map(({ node: filho, details }) => {
            const textos = [...new Set(details.map((d) => evolutionConditionText(expandDetail(d, slug), lang)).filter(Boolean))];
            return (
              <li key={filho.id}>
                <span className="evo-seta">
                  <span aria-hidden="true">→</span>
                  <span className="evo-condicao">
                    {textos.length ? textos.join(lang === "en" ? " or " : " ou ") : tr(lang, "condição especial", "special condition")}
                  </span>
                </span>
                <No node={filho} slug={slug} lang={lang} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default EvolutionsPage;
