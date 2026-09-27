import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePokemonIndex } from "../hooks/usePokemon";
import { fetchJsonPublic } from "../api";
import { pokemonLabel } from "../lib/pokemonLabel";
import { pixelSpriteUrl } from "../lib/sprites";
import { searchCommands, type CommandItem, type CommandKind } from "../lib/commandSearch";
import { REGIONS } from "../data/regions";
import { MYTHS } from "../data/myths";
import { VILLAIN_TEAMS } from "../data/villains";
import { HUMAN_LEGENDS } from "../data/humans";
import { CIVILIZATIONS } from "../data/civilizations";
import { BATTLES } from "../data/battles";
import { DIMENSIONS } from "../data/dimensions";
import { ITEMS } from "../data/items";
import { LANDMARKS } from "../data/landmarks";
import { LORE_EVENTS } from "../data/lore";
import "../styles/commandPalette.css";

const HOUR = 60 * 60 * 1000;

const PAGINAS: CommandItem[] = [
  { kind: "page", label: "Pokédex", to: "/", keywords: ["inicio", "home", "lista"] },
  { kind: "page", label: "Comparar", to: "/comparar", keywords: ["arena", "versus"] },
  { kind: "page", label: "Time", to: "/time", keywords: ["montador", "equipe", "cobertura"] },
  { kind: "page", label: "Mapa", to: "/mapa", keywords: ["regioes", "mundo"] },
  { kind: "page", label: "Jogar", to: "/jogar", keywords: ["emulador", "gba", "rom"] },
  { kind: "page", label: "Treinador", to: "/treinador", keywords: ["ficha", "linha do tempo", "save"] },
  { kind: "page", label: "Lore", to: "/lore", keywords: ["historia", "universo"] },
  { kind: "page", label: "Quiz", to: "/quiz", keywords: ["quem e esse pokemon", "silhueta", "jogo"] },
  { kind: "page", label: "Tamanhos", to: "/tamanhos", keywords: ["altura", "escala"] },
  { kind: "page", label: "Favoritos", to: "/favoritos", keywords: ["colecao"] },
];

const loreDe = (aba: string, rotulo: string, nomes: { label: string }[]): CommandItem[] =>
  nomes.map(({ label }) => ({ kind: "lore", label, to: `/lore?aba=${aba}`, keywords: [], hint: rotulo }));

/** Tudo da lore que tem nome, apontando para a aba onde ele está. */
const LORE: CommandItem[] = [
  ...loreDe("timeline", "Cronologia", LORE_EVENTS.map((e) => ({ label: e.title }))),
  ...loreDe("myths", "Mitos", MYTHS.map((m) => ({ label: m.title }))),
  ...loreDe("villains", "Vilões", VILLAIN_TEAMS.map((v) => ({ label: v.name }))),
  ...loreDe("humans", "Humanos", HUMAN_LEGENDS.map((h) => ({ label: h.name }))),
  ...loreDe("civilizations", "Civilizações", CIVILIZATIONS.map((c) => ({ label: c.name }))),
  ...loreDe("battles", "Batalhas", BATTLES.map((b) => ({ label: b.title }))),
  ...loreDe("dimensions", "Dimensões", DIMENSIONS.map((d) => ({ label: d.name }))),
  ...loreDe("items", "Itens", ITEMS.map((i) => ({ label: i.name }))),
  ...loreDe("landmarks", "Lugares", LANDMARKS.map((l) => ({ label: l.name }))),
];

const REGIOES: CommandItem[] = REGIONS.map((r) => ({
  kind: "region",
  label: r.name,
  to: `/mapa?region=${r.id}`,
  keywords: [r.id, r.inspiration],
  hint: `Geração ${r.generation}`,
}));

const ROTULO_DO_TIPO: Record<CommandKind, string> = {
  page: "Página",
  pokemon: "Pokémon",
  ability: "Habilidade",
  region: "Região",
  lore: "Lore",
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
    return [...PAGINAS, ...REGIOES, ...pokemon, ...abilities, ...LORE];
  }, [index, habilidades.data]);

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
      aria-label="Buscar no site"
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
          placeholder="Pokémon, habilidade, região, lore ou página…"
          role="combobox"
          aria-expanded={resultados.length > 0}
          aria-controls={listId}
          aria-activedescendant={resultados.length ? idDaOpcao(atual) : undefined}
          aria-autocomplete="list"
        />
        {query.trim() && resultados.length === 0 ? (
          <p className="palette-vazio">Nada encontrado para “{query.trim()}”.</p>
        ) : (
          <ul id={listId} role="listbox" className="palette-lista" aria-label="Resultados">
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
                <span className="palette-tipo">{ROTULO_DO_TIPO[r.kind]}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="palette-rodape">
          <kbd>↑</kbd> <kbd>↓</kbd> escolher · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> fechar
        </p>
      </div>
    </dialog>
  );
};

export default CommandPalette;
