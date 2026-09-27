import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMoveDetail, usePokemonDetail, usePokemonIndex } from "../hooks/usePokemon";
import { useTrainerEntry } from "../lib/trainerLog";
import type { Gen3PartyMember } from "../emulator/saveParse/gen3";
import {
  calcGen3Damage,
  gen3MoveData,
  gen3PokemonTypes,
  hitsToKo,
  isPhysicalGen3,
  type Weather,
} from "../lib/gen3Damage";
import { baseStatsOf, gen3Learnset, genericStats } from "../lib/damageSides";
import { abilityForGen3Slot, gen3Abilities, moveSlugById } from "../lib/teamSheet";
import { prettyMoveName } from "../lib/moves";
import { pokemonLabel } from "../lib/pokemonLabel";
import { tType } from "../data/i18n";
import type { TypeName } from "../data/typeMatchups";
import type { Pokemon } from "../types/pokemon";
import type { StatSpread } from "../lib/gen3Stats";
import PokemonMini from "../components/PokemonMini";
import { useLang, tr } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/damage.css";

type Sel = { kind: "team"; index: number } | { kind: "free"; slug: string; level: number };

interface Lado {
  pokemon?: Pokemon;
  nome: string;
  level: number;
  stats?: StatSpread & { maxHp: number };
  types: TypeName[];
  ability?: string;
  /** `key` vai para /move/{key}: slug, ou o número quando a espécie não lista o golpe. */
  moves: { key: string; label: string }[];
  /** Status exatos do save, ou a suposição IV 31 / EV 0 / neutra. */
  exato: boolean;
}

function useLado(sel: Sel, team: Gen3PartyMember[]): Lado {
  const membro = sel.kind === "team" ? team[sel.index] : undefined;
  const alvo = membro ? String(membro.national) : sel.kind === "free" ? sel.slug : undefined;
  const { data: pokemon } = usePokemonDetail(alvo);
  const p = pokemon ?? undefined;

  return useMemo((): Lado => {
    const types = p ? gen3PokemonTypes(p) : [];
    if (membro) {
      return {
        pokemon: p,
        nome: membro.nickname,
        level: membro.level,
        stats: membro.stats,
        types,
        ability: p ? abilityForGen3Slot(p, membro.abilitySlot) : undefined,
        moves: membro.moves.map((m) => {
          const slug = p ? moveSlugById(p.moves, m.id) : undefined;
          return { key: slug ?? String(m.id), label: slug ? prettyMoveName(slug) : `#${m.id}` };
        }),
        exato: true,
      };
    }
    const level = sel.kind === "free" ? sel.level : 50;
    const base = p ? baseStatsOf(p) : undefined;
    return {
      pokemon: p,
      nome: p ? pokemonLabel(p.name) : sel.kind === "free" ? sel.slug : "",
      level,
      stats: base ? genericStats(base, level) : undefined,
      types,
      ability: p ? gen3Abilities(p)[0] : undefined,
      moves: p ? gen3Learnset(p).map((slug) => ({ key: slug, label: prettyMoveName(slug) })) : [],
      exato: false,
    };
  }, [p, membro, sel]);
}

/**
 * Calculadora de dano de Gen 3: o seu time com os status que o jogo gravou,
 * contra qualquer pokémon (ou outro do time).
 */
const DamagePage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const entry = useTrainerEntry();
  const team = entry?.team ?? [];

  const [atk, setAtk] = useState<Sel>(() =>
    team.length ? { kind: "team", index: 0 } : { kind: "free", slug: "treecko", level: 50 }
  );
  const [def, setDef] = useState<Sel>(() => ({
    kind: "free",
    slug: "zigzagoon",
    level: team[0]?.level ?? 50,
  }));
  const [golpe, setGolpe] = useState<string | undefined>(undefined);
  const [crit, setCrit] = useState(false);
  const [burned, setBurned] = useState(false);
  const [weather, setWeather] = useState<Weather>("none");

  const a = useLado(atk, team);
  const d = useLado(def, team);
  const golpeAtual = golpe && a.moves.some((m) => m.key === golpe) ? golpe : a.moves[0]?.key;
  const { data: move, isLoading: carregandoGolpe } = useMoveDetail(golpeAtual);
  const dados = move ? gen3MoveData(move) : undefined;

  const fisico = dados ? isPhysicalGen3(dados.type) : true;
  const pronto = dados && dados.power && a.stats && d.stats && a.types.length && d.types.length;
  const r = pronto
    ? calcGen3Damage({
        level: a.level,
        attack: fisico ? a.stats!.atk : a.stats!.spa,
        defense: fisico ? d.stats!.def : d.stats!.spd,
        power: dados.power!,
        moveType: dados.type,
        attackerTypes: a.types,
        defenderTypes: d.types,
        crit,
        burned,
        weather,
        attackerAbility: a.ability,
        defenderAbility: d.ability,
      })
    : undefined;
  const hp = d.stats?.maxHp ?? 0;
  const ko = r ? hitsToKo(r, hp) : null;
  const pct = (n: number) => (hp ? `${((n / hp) * 100).toFixed(1).replace(".", lang === "en" ? "." : ",")}%` : "—");

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Dano (Gen 3)", "Damage (Gen 3)")}</h1>
        <span className="trainer-sub">
          {t(
            "A fórmula de Ruby, Sapphire, Emerald, FireRed e LeafGreen, seguindo a decompilação.",
            "The Ruby, Sapphire, Emerald, FireRed and LeafGreen formula, following the decompilation."
          )}
        </span>
      </header>

      <div className="dano-lados">
        <EditorDeLado titulo={t("Atacante", "Attacker")} sel={atk} onChange={setAtk} team={team} lado={a} />
        <EditorDeLado titulo={t("Defensor", "Defender")} sel={def} onChange={setDef} team={team} lado={d} />
      </div>

      <fieldset className="dano-opcoes">
        <legend>{t("Golpe e condições", "Move and conditions")}</legend>
        <label>
          {t("Golpe", "Move")}{" "}
          <select value={golpeAtual ?? ""} onChange={(e) => setGolpe(e.target.value)} disabled={!a.moves.length}>
            {a.moves.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} /> {t("Crítico", "Critical hit")}
        </label>
        <label>
          <input type="checkbox" checked={burned} onChange={(e) => setBurned(e.target.checked)} />{" "}
          {t("Atacante queimado", "Attacker burned")}
        </label>
        <label>
          {t("Clima", "Weather")}{" "}
          <select value={weather} onChange={(e) => setWeather(e.target.value as Weather)}>
            <option value="none">{t("Nenhum", "None")}</option>
            <option value="rain">{t("Chuva", "Rain")}</option>
            <option value="sun">{t("Sol forte", "Harsh sun")}</option>
          </select>
        </label>
      </fieldset>

      <section className="dano-resultado" aria-live="polite" aria-labelledby="dano-titulo">
        <h2 id="dano-titulo">{t("Resultado", "Result")}</h2>
        {!dados ? (
          <p className="trainer-sub">{carregandoGolpe ? t("Carregando golpe…", "Loading move…") : t("Escolha um golpe.", "Pick a move.")}</p>
        ) : !dados.power ? (
          <p className="trainer-sub">
            {t(
              "Este golpe não tem poder fixo (status, dano fixo ou poder variável) — a fórmula não se aplica.",
              "This move has no fixed power (status, fixed damage or variable power) — the formula doesn't apply."
            )}
          </p>
        ) : !r ? (
          <p className="trainer-sub">{t("Carregando…", "Loading…")}</p>
        ) : r.effectiveness === 0 ? (
          <p className="dano-numero">
            <strong>{t("Sem efeito", "No effect")}</strong>{" "}
            <span>
              {tType(dados.type)} {t("não atinge", "doesn't affect")} {d.nome}
              {d.ability === "levitate" && dados.type === "ground" ? " (Levitate)" : ""}
            </span>
          </p>
        ) : (
          <>
            <p className="dano-numero">
              <strong>
                {r.min}–{r.max}
              </strong>{" "}
              <span>
                {t("de dano", "damage")} · {pct(r.min)}–{pct(r.max)} {t("do HP", "of HP")} ({hp})
              </span>
            </p>
            <p>
              {ko
                  ? ko.hits === 1
                    ? ko.guaranteed
                      ? t("Nocaute garantido num golpe.", "Guaranteed one-hit KO.")
                      : t("Chance de nocaute num golpe.", "Chance to KO in one hit.")
                    : ko.guaranteed
                      ? t(`Nocaute garantido em ${ko.hits} golpes.`, `Guaranteed ${ko.hits}-hit KO.`)
                      : t(`Chance de nocaute em ${ko.hits} golpes.`, `Chance to KO in ${ko.hits} hits.`)
                  : null}
            </p>
            <ul className="dano-fatos">
              <li>
                {tType(dados.type)} · {fisico ? t("físico", "physical") : t("especial", "special")} ·{" "}
                {t("poder", "power")} {dados.power}
              </li>
              {r.effectiveness !== 1 && (
                <li>
                  {r.effectiveness > 1 ? t("super efetivo", "super effective") : t("pouco efetivo", "not very effective")}{" "}
                  ×{String(r.effectiveness).replace(".", lang === "en" ? "." : ",")}
                </li>
              )}
              {a.types.includes(dados.type) && <li>STAB ×1,5</li>}
              {a.ability && ["huge-power", "pure-power"].includes(a.ability) && fisico && (
                <li>{prettyMoveName(a.ability)}: {t("ataque ×2", "attack ×2")}</li>
              )}
              {d.ability === "thick-fat" && (dados.type === "fire" || dados.type === "ice") && (
                <li>Thick Fat: {t("ataque ÷2", "attack ÷2")}</li>
              )}
            </ul>
            <details className="dano-rolagens">
              <summary>{t("As 16 rolagens (85% a 100%)", "All 16 rolls (85% to 100%)")}</summary>
              <p>{r.rolls.join(", ")}</p>
            </details>
          </>
        )}
        <p className="trainer-sub">
          {t(
            "Fora da conta: estágios de status, Reflect/Light Screen, batalha dupla, itens e as habilidades que dependem da batalha.",
            "Not included: stat stages, Reflect/Light Screen, double battles, items and battle-state abilities."
          )}
        </p>
      </section>
    </div>
  );
};

interface EditorProps {
  titulo: string;
  sel: Sel;
  onChange: (s: Sel) => void;
  team: Gen3PartyMember[];
  lado: Lado;
}

const EditorDeLado = ({ titulo, sel, onChange, team, lado }: EditorProps) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { index } = usePokemonIndex();
  const nomes = useMemo(() => [...(index?.keys() ?? [])], [index]);
  const [texto, setTexto] = useState(sel.kind === "free" ? sel.slug : "");
  const id = `dano-${titulo}`;

  return (
    <fieldset className="dano-lado">
      <legend>{titulo}</legend>
      {team.length > 0 && (
        <div className="dano-fonte" role="radiogroup" aria-label={t("De onde", "Source")}>
          <label>
            <input
              type="radio"
              checked={sel.kind === "team"}
              onChange={() => onChange({ kind: "team", index: 0 })}
            />{" "}
            {t("Do seu time", "From your team")}
          </label>
          <label>
            <input
              type="radio"
              checked={sel.kind === "free"}
              onChange={() => onChange({ kind: "free", slug: texto || "zigzagoon", level: lado.level || 50 })}
            />{" "}
            {t("Qualquer pokémon", "Any Pokémon")}
          </label>
        </div>
      )}

      {sel.kind === "team" ? (
        <label>
          {t("Membro", "Member")}{" "}
          <select value={sel.index} onChange={(e) => onChange({ kind: "team", index: Number(e.target.value) })}>
            {team.map((m, i) => (
              <option key={m.personality} value={i}>
                {m.nickname} · {t("nv", "lv")} {m.level}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="dano-livre">
          <label htmlFor={id}>{t("Espécie", "Species")}</label>
          <input
            id={id}
            list={`${id}-nomes`}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              const slug = e.target.value.trim().toLowerCase();
              if (index?.has(slug)) onChange({ ...sel, slug });
            }}
          />
          <datalist id={`${id}-nomes`}>
            {nomes.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <label>
            {t("Nível", "Level")}{" "}
            <input
              type="number"
              min={1}
              max={100}
              value={sel.level}
              onChange={(e) => onChange({ ...sel, level: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
            />
          </label>
        </div>
      )}

      <div className="dano-resumo">
        {lado.pokemon && (
          <PokemonMini id={lado.pokemon.id} label={lado.nome} sub={`${t("nv", "lv")} ${lado.level}`} slug={lado.pokemon.name} />
        )}
        <div>
          <p>
            {lado.types.map((ty) => (
              <span key={ty} className="card-type-dot card-type-dot-lg" data-type={ty}>
                {tType(ty)}
              </span>
            ))}
          </p>
          {lado.ability && <p className="trainer-sub">{prettyMoveName(lado.ability)}</p>}
          {lado.stats && (
            <p className="trainer-sub">
              HP {lado.stats.maxHp} · Atq {lado.stats.atk} · Def {lado.stats.def} · AtE {lado.stats.spa} · DfE{" "}
              {lado.stats.spd}
            </p>
          )}
          <p className="trainer-sub">
            {lado.exato
              ? t("Status do save.", "Stats from the save.")
              : t("Suposição: IV 31, sem EVs, natureza neutra.", "Assumed: IV 31, no EVs, neutral nature.")}
          </p>
        </div>
      </div>
      {team.length === 0 && (
        <p className="trainer-sub">
          {t("Com um save lido em", "With a save read in")} <Link to="/jogar">{t("Jogar", "Play")}</Link>,{" "}
          {t("o seu time entra aqui com os status exatos.", "your team shows up here with exact stats.")}
        </p>
      )}
    </fieldset>
  );
};

export default DamagePage;
