import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePokemonIndex } from "../hooks/usePokemon";
import { fetchJsonPublic } from "../api";
import { pokemonLabel } from "../lib/pokemonLabel";
import { pixelSpriteUrl } from "../lib/sprites";
import { searchCommands, type CommandItem, type CommandKind } from "../lib/commandSearch";
import { loreFor } from "../i18n/lore";
import "../styles/commandPalette.css";
import { useLang, tr, type Lang } from "../i18n/lang";
import { generationLabel } from "../i18n/common";

const HOUR = 60 * 60 * 1000;

/**
 * As páginas, com rótulo no idioma do site e palavras-chave nos dois: quem
 * está em inglês e digita "equipe" também acha o Time.
 */
const PAGINAS: { to: string; pt: string; en: string; keywords: string[] }[] = [
  { to: "/", pt: "Pokédex", en: "Pokédex", keywords: ["inicio", "home", "lista", "list"] },
  { to: "/comparar", pt: "Comparar", en: "Compare", keywords: ["arena", "versus"] },
  { to: "/time", pt: "Time", en: "Team", keywords: ["montador", "equipe", "cobertura", "builder", "coverage"] },
  { to: "/mapa", pt: "Mapa", en: "Map", keywords: ["regioes", "mundo", "regions", "world"] },
  { to: "/dados", pt: "Seus dados (exportar/importar)", en: "Your data (export/import)", keywords: ["dados", "data", "backup", "exportar", "export", "importar", "import", "sincronizar", "sync", "outro aparelho", "device"] },
  { to: "/jogos", pt: "Linha do tempo dos jogos", en: "Games timeline", keywords: ["jogos", "games", "timeline", "linha do tempo", "lançamento", "release", "remake"] },
  { to: "/evolucoes", pt: "Evoluções", en: "Evolutions", keywords: ["evolução", "evolution", "árvore", "tree", "pedra", "stone", "troca", "trade"] },
  { to: "/lore", pt: "Lore", en: "Lore", keywords: ["historia", "universo", "history", "universe"] },
  { to: "/quiz", pt: "Quiz", en: "Quiz", keywords: ["quem e esse pokemon", "silhueta", "jogo", "whos that pokemon", "silhouette"] },
  { to: "/tamanhos", pt: "Tamanhos", en: "Sizes", keywords: ["altura", "escala", "height", "scale"] },
  { to: "/favoritos", pt: "Favoritos", en: "Favorites", keywords: ["colecao", "collection"] },
];

const paginas = (lang: Lang): CommandItem[] =>
  PAGINAS.map((p) => ({
    kind: "page",
    label: lang === "en" ? p.en : p.pt,
    to: p.to,
    keywords: [p.pt, p.en, ...p.keywords],
  }));

const loreDe = (aba: string, rotulo: string, nomes: { label: string }[]): CommandItem[] =>
  nomes.map(({ label }) => ({ kind: "lore", label, to: `/lore?aba=${aba}`, keywords: [], hint: rotulo }));

/** Tudo da lore que tem nome, apontando para a aba onde ele está. */
const lore = (lang: Lang): CommandItem[] => {
  const t = (pt: string, en: string) => tr(lang, pt, en);
  // Os títulos no idioma do site.
  const {
    events: LORE_EVENTS,
    myths: MYTHS,
    villains: VILLAIN_TEAMS,
    humans: HUMAN_LEGENDS,
    civilizations: CIVILIZATIONS,
    battles: BATTLES,
    dimensions: DIMENSIONS,
    items: ITEMS,
    landmarks: LANDMARKS,
  } = loreFor(lang);
  return [
    ...loreDe("timeline", t("Cronologia", "Timeline"), LORE_EVENTS.map((e) => ({ label: e.title }))),
    ...loreDe("myths", t("Mitos", "Myths"), MYTHS.map((m) => ({ label: m.title }))),
    ...loreDe("villains", t("Vilões", "Villains"), VILLAIN_TEAMS.map((v) => ({ label: v.name }))),
    ...loreDe("humans", t("Humanos", "Humans"), HUMAN_LEGENDS.map((h) => ({ label: h.name }))),
    ...loreDe("civilizations", t("Civilizações", "Civilizations"), CIVILIZATIONS.map((c) => ({ label: c.name }))),
    ...loreDe("battles", t("Batalhas", "Battles"), BATTLES.map((b) => ({ label: b.title }))),
    ...loreDe("dimensions", t("Dimensões", "Dimensions"), DIMENSIONS.map((d) => ({ label: d.name }))),
    ...loreDe("items", t("Itens", "Items"), ITEMS.map((i) => ({ label: i.name }))),
    ...loreDe("landmarks", t("Lugares", "Places"), LANDMARKS.map((l) => ({ label: l.name }))),
  ];
};

const regioes = (lang: Lang): CommandItem[] =>
  loreFor(lang).regions.map((r) => ({
    kind: "region",
    label: r.name,
    to: `/mapa?region=${r.id}`,
    keywords: [r.id, r.inspiration],
    hint: generationLabel(r.generation, lang),
  }));

const ROTULO_DO_TIPO: Record<CommandKind, [string, string]> = {
  page: ["Página", "Page"],
  pokemon: ["Pokémon", "Pokémon"],
  ability: ["Habilidade", "Ability"],
  region: ["Região", "Region"],
  lore: ["Lore", "Lore"],
};

const humanize = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

interface Props {
  onClose: () => void;
}

/**
 * Paleta de busca: Pokémon, habilidades, regiões, verbetes da lore e as
 * páginas do site, num lugar só. Teclado inteiro: ↑ ↓ escolhem, Enter abre,
 * Esc fecha (o `<dialog>` nativo cuida do Esc e do foco).
 */
const CommandPalette = ({ onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [ativo, setAtivo] = useState(0);
  const listId = useId();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  const { index } = usePokemonIndex();
  const habilidades = useQuery<{ results: { name: string }[] } | null>({
    queryKey: ["ability-index"],
    queryFn: ({ signal }) =>
      fetchJsonPublic<{ results: { name: string }[] }>("https://pokeapi.co/api/v2/ability?limit=400", signal),
    staleTime: HOUR,
    gcTime: HOUR,
  });

  const itens = useMemo<CommandItem[]>(() => {
    const pokemon: CommandItem[] = [...(index ?? [])].map(([name, id]) => ({
      kind: "pokemon",
      label: pokemonLabel(name),
      to: `/pokemon/${name}`,
      keywords: [name, String(id)],
      hint: `#${String(id).padStart(4, "0")}`,
      spriteId: id,
    }));
    const abilities: CommandItem[] = (habilidades.data?.results ?? []).map((a) => ({
      kind: "ability",
      label: humanize(a.name),
      to: `/habilidade/${a.name}`,
      keywords: [a.name],
    }));
    return [...paginas(lang), ...regioes(lang), ...pokemon, ...abilities, ...lore(lang)];
  }, [index, habilidades.data, lang]);

  const resultados = useMemo(() => searchCommands(query, itens), [query, itens]);
  const atual = Math.min(ativo, Math.max(0, resultados.length - 1));

  /**
   * Fecha e desmonta na hora. O evento `close` do <dialog> chega numa tarefa
   * separada, e o navegador pode segurá-la — com a aba oculta, medido, ela não
   * chegou em 3 s. Esperar por ele deixava a paleta montada e o teclado do
   * jogo desligado. O `onClose` do elemento fica só como rede de segurança.
   */
  const fechar = () => {
    dialogRef.current?.close();
    onClose();
  };

  const abrir = (item: CommandItem) => {
    fechar();
    navigate(item.to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((a) => (resultados.length ? (Math.min(a, resultados.length - 1) + 1) % resultados.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((a) =>
        resultados.length ? (Math.min(a, resultados.length - 1) - 1 + resultados.length) % resultados.length : 0
      );
    } else if (e.key === "Enter" && resultados[atual]) {
      e.preventDefault();
      abrir(resultados[atual]);
    }
  };

  const idDaOpcao = (i: number) => `${listId}-${i}`;

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label={t("Buscar no site", "Search the site")}
      onClose={onClose}
      onClick={(e) => {
        // Clique no fundo (fora da caixa) fecha.
        if (e.target === dialogRef.current) fechar();
      }}
    >
      <div className="palette-caixa">
        <input
          className="palette-input"
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setAtivo(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("Pokémon, habilidade, região, lore ou página…", "Pokémon, ability, region, lore or page…")}
          role="combobox"
          aria-expanded={resultados.length > 0}
          aria-controls={listId}
          aria-activedescendant={resultados.length ? idDaOpcao(atual) : undefined}
          aria-autocomplete="list"
        />
        {query.trim() && resultados.length === 0 ? (
          <p className="palette-vazio">
            {t("Nada encontrado para", "Nothing found for")} “{query.trim()}”.
          </p>
        ) : (
          <ul id={listId} role="listbox" className="palette-lista" aria-label={t("Resultados", "Results")}>
            {resultados.map((r, i) => (
              <li
                key={`${r.kind}-${r.to}-${r.label}`}
                id={idDaOpcao(i)}
                role="option"
                aria-selected={i === atual}
                className={`palette-item${i === atual ? " is-ativo" : ""}`}
                onMouseMove={() => setAtivo(i)}
                onClick={() => abrir(r)}
              >
                {r.spriteId ? (
                  <img src={pixelSpriteUrl(r.spriteId)} alt="" width={32} height={32} loading="lazy" />
                ) : (
                  <span className="palette-icone" aria-hidden="true" />
                )}
                <span className="palette-rotulo">{r.label}</span>
                {r.hint && <span className="palette-dica">{r.hint}</span>}
                <span className="palette-tipo">{t(...ROTULO_DO_TIPO[r.kind])}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="palette-rodape">
          <kbd>↑</kbd> <kbd>↓</kbd> {t("escolher", "choose")} · <kbd>Enter</kbd> {t("abrir", "open")} ·{" "}
          <kbd>Esc</kbd> {t("fechar", "close")}
        </p>
      </div>
    </dialog>
  );
};

export default CommandPalette;
