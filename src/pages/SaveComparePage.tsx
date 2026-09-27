import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { entryFromSave, useTrainerEntries, type TrainerEntry } from "../lib/trainerLog";
import { compareEntries, type RowKey } from "../lib/compareSaves";
import { parseGen3Save } from "../emulator/saveParse/gen3";
import { formatMoney, formatPlayTime } from "../lib/trainerText";
import { gameLabel } from "../lib/gen3Game";
import { usePokemonIndex } from "../hooks/usePokemon";
import { pokemonLabel } from "../lib/pokemonLabel";
import PokemonMini from "../components/PokemonMini";
import { useLang, tr, type Lang } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/saveCompare.css";

/** Um lado: uma ficha guardada (pela ROM) ou um `.sav` carregado agora. */
type Lado = { kind: "rom"; rom: string } | { kind: "file"; entry: TrainerEntry } | null;

const ROTULOS: Record<RowKey, [string, string]> = {
  owned: ["Capturados", "Caught"],
  seen: ["Vistos", "Seen"],
  badges: ["Insígnias", "Badges"],
  achievements: ["Conquistas", "Achievements"],
  topLevel: ["Maior nível no time", "Top team level"],
  pc: ["No PC", "In the PC"],
  time: ["Tempo de jogo", "Play time"],
  money: ["Dinheiro", "Money"],
};

function formatar(key: RowKey, v: number | null, lang: Lang): string {
  if (v === null) return "—";
  if (key === "time") return formatPlayTime(v);
  if (key === "money") return formatMoney(v, lang);
  return String(v);
}

/** Quantos minis mostrar em cada lista da diferença antes do "e mais N". */
const LIMITE = 60;

/**
 * Dois saves lado a lado. Cada lado vem das fichas que `/jogar` já gravou ou
 * de um `.sav` escolhido aqui — que é lido no navegador e não entra no
 * registro nem na linha do tempo.
 */
const SaveComparePage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const fichas = useTrainerEntries();
  const [ladoA, setLadoA] = useState<Lado>(null);
  const [ladoB, setLadoB] = useState<Lado>(null);
  const { index } = usePokemonIndex();

  const slugOf = useMemo(() => {
    const m = new Map<number, string>();
    for (const [name, id] of index ?? []) if (!m.has(id)) m.set(id, name);
    return m;
  }, [index]);
  const nameOf = useCallback((n: number) => {
    const slug = slugOf.get(n);
    return slug ? pokemonLabel(slug) : `#${n}`;
  }, [slugOf]);

  // Sem escolha, A é a ficha mais recente e B a seguinte.
  const resolver = (lado: Lado, padrao: TrainerEntry | undefined): TrainerEntry | undefined => {
    if (lado?.kind === "file") return lado.entry;
    if (lado?.kind === "rom") return fichas.find((f) => f.rom === lado.rom);
    return padrao;
  };
  const a = resolver(ladoA, fichas[0]);
  const b = resolver(ladoB, fichas[1]);
  const cmp = a && b ? compareEntries(a, b) : null;

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Comparar saves", "Compare saves")}</h1>
        <span className="trainer-rom">
          <Link to="/treinador">{t("← Treinador", "← Trainer")}</Link>
        </span>
      </header>

      <div className="savecmp-lados">
        <EscolherLado titulo="A" fichas={fichas} atual={a} onChange={setLadoA} />
        <EscolherLado titulo="B" fichas={fichas} atual={b} onChange={setLadoB} />
      </div>

      {!cmp ? (
        <p className="trainer-vazio">
          {t(
            "Escolha dois saves: as fichas que o site já leu em Jogar, ou um arquivo .sav de Gen 3 (o seu de outro jogo, o de um amigo).",
            "Pick two saves: the cards the site already read in Play, or a Gen 3 .sav file (yours from another game, a friend's)."
          )}
        </p>
      ) : (
        <>
          <section aria-labelledby="savecmp-numeros">
            <h2 id="savecmp-numeros">{t("Números", "Numbers")}</h2>
            <table className="savecmp-tabela">
              <thead>
                <tr>
                  <th scope="col"><span className="visually-hidden">{t("Dado", "Stat")}</span></th>
                  <th scope="col">A · {a?.playerName}</th>
                  <th scope="col">B · {b?.playerName}</th>
                </tr>
              </thead>
              <tbody>
                {cmp.rows.map((r) => (
                  <tr key={r.key}>
                    <th scope="row">{lang === "en" ? ROTULOS[r.key][1] : ROTULOS[r.key][0]}</th>
                    <td className={r.ahead === "a" ? "frente" : undefined}>
                      {formatar(r.key, r.a, lang)}
                      {r.ahead === "a" && <span className="visually-hidden">{t(" (à frente)", " (ahead)")}</span>}
                    </td>
                    <td className={r.ahead === "b" ? "frente" : undefined}>
                      {formatar(r.key, r.b, lang)}
                      {r.ahead === "b" && <span className="visually-hidden">{t(" (à frente)", " (ahead)")}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="savecmp-times">
            <h2 id="savecmp-times">{t("Times", "Teams")}</h2>
            <div className="savecmp-lados">
              {[a, b].map((e, i) => (
                <div key={i}>
                  <h3>{i === 0 ? "A" : "B"} · {e?.playerName}</h3>
                  <div className="trainer-minis">
                    {e?.party.map((m) => (
                      <PokemonMini key={m.personality} id={m.national} label={m.nickname} sub={`${t("nv", "lv")} ${m.level}`} slug={slugOf.get(m.national)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="savecmp-dex">
            <h2 id="savecmp-dex">
              {t("Diferença de Pokédex", "Pokédex difference")}{" "}
              <span className="trainer-de">
                {t(`${cmp.both.length} em comum`, `${cmp.both.length} in common`)}
              </span>
            </h2>
            <div className="savecmp-lados">
              {([["A", cmp.onlyA], ["B", cmp.onlyB]] as const).map(([lado, lista]) => (
                <div key={lado}>
                  <h3>
                    {t(`Só ${lado} capturou`, `Only ${lado} caught`)} <span className="trainer-de">{lista.length}</span>
                  </h3>
                  {lista.length === 0 ? (
                    <p className="trainer-sub">{t("Nada que o outro não tenha.", "Nothing the other lacks.")}</p>
                  ) : (
                    <div className="trainer-minis">
                      {lista.slice(0, LIMITE).map((n) => (
                        <PokemonMini key={n} id={n} label={nameOf(n)} sub={`#${n}`} slug={slugOf.get(n)} />
                      ))}
                      {lista.length > LIMITE && (
                        <span className="trainer-sub">{t(`e mais ${lista.length - LIMITE}`, `and ${lista.length - LIMITE} more`)}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

interface EscolherProps {
  titulo: string;
  fichas: TrainerEntry[];
  atual: TrainerEntry | undefined;
  onChange: (l: Lado) => void;
}

const ARQUIVO = "__arquivo__";

const EscolherLado = ({ titulo, fichas, atual, onChange }: EscolherProps) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const id = `savecmp-${titulo}`;
  const deArquivo = atual !== undefined && !fichas.includes(atual);

  const carregar = async (f: File | undefined) => {
    if (!f) return;
    setErro(null);
    const save = parseGen3Save(new Uint8Array(await f.arrayBuffer()));
    const entry = save ? entryFromSave(f.name, save) : null;
    if (!entry) {
      setErro(t("Não é um save de Gen 3 que o site entenda.", "Not a Gen 3 save the site understands."));
      return;
    }
    setArquivo(f.name);
    onChange({ kind: "file", entry });
  };

  return (
    <fieldset className="savecmp-lado">
      <legend>{t(`Lado ${titulo}`, `Side ${titulo}`)}</legend>
      <label htmlFor={id}>{t("Ficha", "Card")}</label>{" "}
      <select
        id={id}
        value={deArquivo ? ARQUIVO : atual?.rom ?? ""}
        onChange={(e) => {
          if (e.target.value !== ARQUIVO) onChange({ kind: "rom", rom: e.target.value });
        }}
      >
        {!atual && <option value="">{t("— escolha —", "— pick —")}</option>}
        {fichas.map((f) => (
          <option key={f.rom} value={f.rom}>
            {f.rom.replace(/\.[^.]+$/, "")} · {f.playerName}
          </option>
        ))}
        {deArquivo && <option value={ARQUIVO}>{arquivo}</option>}
      </select>
      <label className="savecmp-arquivo">
        {t("ou carregar um .sav", "or load a .sav")}
        <input type="file" accept=".sav,.srm,application/octet-stream" onChange={(e) => void carregar(e.target.files?.[0])} />
      </label>
      {erro && <p className="savecmp-erro" role="alert">{erro}</p>}
      {atual && (
        <p className="trainer-sub">
          {atual.playerName} · {gameLabel(atual.game ?? "emerald")}
        </p>
      )}
    </fieldset>
  );
};

export default SaveComparePage;
