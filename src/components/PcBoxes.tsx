import { useMemo, useState } from "react";
import PokemonMini from "./PokemonMini";
import TeamMemberSheet from "./TeamMemberSheet";
import { usePokemonDetail } from "../hooks/usePokemon";
import {
  boxMonAsMember,
  isFullBoxMon,
  listPc,
  type PcEntry,
  type PcSort,
  type StoredBox,
} from "../lib/pcBoxes";
import { baseStatsOf } from "../lib/damageSides";
import { useLang, tr } from "../i18n/lang";
import "../styles/pc.css";

interface Props {
  boxes: StoredBox[];
  nameOf: (national: number) => string;
  slugOf: (national: number) => string | undefined;
}

const POR_CAIXA = 30;

const chave = (e: PcEntry) => `${e.box}-${e.mon.slot ?? e.mon.nickname}-${e.mon.personality ?? ""}`;

/**
 * As 14 caixas do PC: busca por apelido, espécie ou número, filtro por caixa
 * e shiny, e a ficha de cada pokémon ao clicar.
 */
const PcBoxes = ({ boxes, nameOf, slugOf }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [query, setQuery] = useState("");
  const [box, setBox] = useState<number | "all">("all");
  const [shinyOnly, setShinyOnly] = useState(false);
  const [sort, setSort] = useState<PcSort>("box");
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const total = boxes.reduce((n, c) => n + c.pokemon.length, 0);
  const lista = useMemo(
    () => listPc(boxes, { query, box, shinyOnly, sort }, nameOf),
    [boxes, query, box, shinyOnly, sort, nameOf]
  );
  const selecionado = lista.find((e) => chave(e) === escolhido);

  const mini = (e: PcEntry) => (
    <PokemonMini
      key={chave(e)}
      id={e.mon.national}
      label={e.mon.nickname}
      sub={[e.level !== null ? `${t("nv", "lv")} ${e.level}` : undefined, e.mon.shiny ? "✨" : undefined]
        .filter(Boolean)
        .join(" ")}
      onSelect={() => setEscolhido(chave(e) === escolhido ? null : chave(e))}
      selected={chave(e) === escolhido}
    />
  );

  // Agrupado por caixa só na ordem das caixas; nas outras ordens, uma grade só.
  const grupos: { box: number; itens: PcEntry[] }[] = [];
  if (sort === "box") {
    for (const e of lista) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.box === e.box) ultimo.itens.push(e);
      else grupos.push({ box: e.box, itens: [e] });
    }
  }

  return (
    <section aria-labelledby="pc-titulo">
      <h2 id="pc-titulo">
        PC <span className="trainer-de">{total} pokémon</span>
      </h2>
      {total === 0 ? (
        <p className="trainer-sub">{t("As 14 caixas estão vazias.", "All 14 boxes are empty.")}</p>
      ) : (
        <>
          <div className="pc-filtros" role="search">
            <label className="pc-busca">
              <span className="visually-hidden">{t("Buscar no PC", "Search the PC")}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Apelido, espécie ou nº", "Nickname, species or #")}
              />
            </label>
            <label>
              {t("Caixa", "Box")}{" "}
              <select
                value={box}
                onChange={(e) => setBox(e.target.value === "all" ? "all" : Number(e.target.value))}
              >
                <option value="all">{t("Todas", "All")}</option>
                {boxes.map((c, i) => (
                  <option key={i} value={i}>
                    {c.name} ({c.pokemon.length})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("Ordem", "Sort")}{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value as PcSort)}>
                <option value="box">{t("Caixa", "Box")}</option>
                <option value="dex">{t("Nº da dex", "Dex #")}</option>
                <option value="level">{t("Nível", "Level")}</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={shinyOnly} onChange={(e) => setShinyOnly(e.target.checked)} />{" "}
              {t("Só shiny", "Shiny only")}
            </label>
          </div>
          <p className="trainer-sub" aria-live="polite">
            {lista.length === total
              ? t("Clique num pokémon para ver a ficha.", "Click a Pokémon to see its details.")
              : t(`${lista.length} de ${total}`, `${lista.length} of ${total}`)}
          </p>

          {lista.length === 0 ? (
            <p className="trainer-sub">{t("Nada no PC com esse filtro.", "Nothing in the PC matches.")}</p>
          ) : sort === "box" ? (
            grupos.map((g) => (
              <div key={g.box} className="trainer-caixa">
                <h3>
                  {boxes[g.box]?.name}{" "}
                  <span className="trainer-de">
                    {boxes[g.box]?.pokemon.length}/{POR_CAIXA}
                  </span>
                </h3>
                <div className="trainer-minis">{g.itens.map(mini)}</div>
              </div>
            ))
          ) : (
            <div className="trainer-minis">{lista.map(mini)}</div>
          )}

          {selecionado && (
            <PcMonDetail
              key={chave(selecionado)}
              entry={selecionado}
              boxName={boxes[selecionado.box]?.name ?? ""}
              slug={slugOf(selecionado.mon.national)}
              nameOf={nameOf}
              onClose={() => setEscolhido(null)}
            />
          )}
        </>
      )}
    </section>
  );
};

interface DetailProps {
  entry: PcEntry;
  boxName: string;
  slug?: string;
  nameOf: (national: number) => string;
  onClose: () => void;
}

const PcMonDetail = ({ entry, boxName, slug, nameOf, onClose }: DetailProps) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { data: pokemon } = usePokemonDetail(slug);
  const { mon, level } = entry;
  const base = pokemon ? baseStatsOf(pokemon) : undefined;
  const membro = isFullBoxMon(mon) && level !== null && base ? boxMonAsMember(mon, level, base) : undefined;

  return (
    <aside className="pc-detalhe" aria-label={t(`Ficha de ${mon.nickname}`, `${mon.nickname} details`)}>
      <div className="pc-detalhe-topo">
        <PokemonMini id={mon.national} label={nameOf(mon.national)} slug={slug} />
        <div>
          <strong>{mon.nickname}</strong>
          <span className="trainer-sub">
            {level !== null && `${t("nível", "level")} ${level} · `}
            {boxName}
            {mon.slot !== undefined && `, ${t("posição", "slot")} ${mon.slot + 1}`}
          </span>
        </div>
        <button type="button" className="pc-fechar" onClick={onClose} aria-label={t("Fechar ficha", "Close details")}>
          ✕
        </button>
      </div>
      {!isFullBoxMon(mon) ? (
        <p className="trainer-sub">
          {t(
            "A ficha completa aparece depois que o jogo salvar de novo em Jogar.",
            "Full details show up after the game saves again in Play."
          )}
        </p>
      ) : membro ? (
        <TeamMemberSheet membro={membro} pokemon={pokemon ?? undefined} defaultOpen />
      ) : (
        <p className="trainer-sub">{t("Carregando…", "Loading…")}</p>
      )}
    </aside>
  );
};

export default PcBoxes;
