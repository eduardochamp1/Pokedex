import { useMemo, useState, type ReactNode } from "react";
import { usePokemonIndex } from "../../hooks/usePokemon";
import { pixelSpriteUrl } from "../../lib/sprites";
import { pokemonLabel } from "../../lib/pokemonLabel";
import { useLang, tr } from "../../i18n/lang";

/** Quantos entram por vez: a lista inteira são mais de 1.300 linhas com imagem. */
const LOTE = 60;

interface Props {
  /** A marca à direita de cada linha (A/B, ✓, +). */
  mark: (name: string) => ReactNode;
  /** Linha destacada (já escolhida). */
  isOn?: (name: string) => boolean;
  onPick: (name: string) => void;
  /** Só estes nomes, em vez do índice inteiro (ex.: os favoritos). */
  names?: string[];
  emptyText?: string;
}

/**
 * O elenco: todos os pokémon, com busca, para escolher um.
 *
 * É a tela da esquerda de Comparar, Time e Tamanhos — as três fazem a mesma
 * coisa (apontar pokémon) e só mudam o que acontece ao tocar.
 */
const RosterList = ({ mark, isOn, onPick, names, emptyText }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { index } = usePokemonIndex();
  const [q, setQ] = useState("");
  const [limite, setLimite] = useState(LOTE);

  const todos = useMemo(() => names ?? (index ? [...index.keys()] : []), [names, index]);
  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return todos;
    // Número exato ou pedaço do nome.
    return todos.filter((n) => n.includes(termo) || String(index?.get(n) ?? "") === termo);
  }, [todos, q, index]);
  const visiveis = filtrados.slice(0, limite);

  return (
    <>
      <div className="pane-bar roster-bar">
        <input
          className="pane-input"
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimite(LOTE);
          }}
          placeholder={t("Buscar Pokémon ou número", "Search Pokémon or number")}
          aria-label={t("Buscar no elenco", "Search the roster")}
        />
      </div>
      <div className="pane-scroll">
        {!index && !names ? (
          <p className="pane-empty">{t("CARREGANDO…", "LOADING…")}</p>
        ) : filtrados.length === 0 ? (
          <p className="pane-empty">{emptyText ?? t("NENHUM POKEMON ENCONTRADO", "NO POKEMON FOUND")}</p>
        ) : (
          <ul className="roster">
            {visiveis.map((name) => {
              const id = index?.get(name);
              return (
                <li key={name}>
                  <button type="button" className="pane-row roster-row" aria-pressed={isOn?.(name) ?? false} onClick={() => onPick(name)}>
                    <img className="pixelated" src={id ? pixelSpriteUrl(id) : undefined} width={56} height={56} alt="" loading="lazy" />
                    <span className="roster-num">{id ? String(id).padStart(4, "0") : ""}</span>
                    <span className="roster-name">{pokemonLabel(name, lang)}</span>
                    <span className="roster-mark">{mark(name)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {filtrados.length > limite && (
          <button type="button" className="pane-btn" onClick={() => setLimite((n) => n + LOTE)}>
            {t("MAIS", "MORE")} ({filtrados.length - limite})
          </button>
        )}
      </div>
    </>
  );
};

export default RosterList;
