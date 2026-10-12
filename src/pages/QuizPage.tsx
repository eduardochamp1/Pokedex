import { usePtFlavor } from "../i18n/ptData";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePokemonDetail, usePokemonIndex, usePokemonSpecies } from "../hooks/usePokemon";
import { pixelSpriteUrl } from "../lib/sprites";
import { pokemonLabel } from "../lib/pokemonLabel";
import {
  GEN_RANGES,
  loadBest,
  makeRound,
  parseQuizGen,
  poolFor,
  saveBest,
  type QuizGen,
  type Round,
} from "../lib/quiz";
import {
  DAILY_ROUNDS,
  dailyRounds,
  loadDaily,
  parseQuizMode,
  redactName,
  saveDaily,
  seededRandom,
  shareText,
  typeOptions,
  type QuizMode,
  type RoundMode,
} from "../lib/quizModes";
import { dayNumber } from "../lib/daily";
import { pickLocalized } from "../lib/localize";
import { tType } from "../data/i18n";
import "../styles/quiz.css";
import { useLang, tr } from "../i18n/lang";
import { generationLabel } from "../i18n/common";

/** Número nacional -> slug; a primeira entrada do índice é a espécie base. */
function useNomes() {
  const { index } = usePokemonIndex();
  const slugOf = useMemo(() => {
    const m = new Map<number, string>();
    for (const [name, id] of index ?? []) if (!m.has(id)) m.set(id, name);
    return m;
  }, [index]);
  const nome = useCallback(
    (id: number) => {
      const slug = slugOf.get(id);
      return slug ? pokemonLabel(slug) : `#${id}`;
    },
    [slugOf]
  );
  return { pronto: Boolean(index), slugOf, nome };
}

const ABAS: { mode: QuizMode; pt: string; en: string }[] = [
  { mode: "silhueta", pt: "Silhueta", en: "Silhouette" },
  { mode: "grito", pt: "Grito", en: "Cry" },
  { mode: "descricao", pt: "Descrição", en: "Description" },
  { mode: "tipo", pt: "Tipo", en: "Type" },
  { mode: "diario", pt: "Desafio do dia", en: "Daily challenge" },
];

/**
 * O quiz: "Quem é esse Pokémon?" em quatro modos, e o desafio do dia. Modo e
 * recorte ficam na URL (`?modo=grito&ger=3`).
 */
const QuizPage = () => {
  const [params, setParams] = useSearchParams();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const mode = parseQuizMode(params.get("modo"));

  const trocarModo = (m: QuizMode) => {
    const p = new URLSearchParams(params);
    if (m === "silhueta") p.delete("modo");
    else p.set("modo", m);
    setParams(p, { replace: true });
  };

  useDevicePage({ labels: [t("MODOS", "MODES"), t("RODADA", "ROUND")] });

  const modos = (
    <nav className="quiz-modos" aria-label={t("Modos do quiz", "Quiz modes")}>
      {ABAS.map((a) => (
        <button
          key={a.mode}
          type="button"
          className="pane-row"
          aria-pressed={a.mode === mode}
          onClick={() => trocarModo(a.mode)}
        >
          <span className="quiz-modo-cursor" aria-hidden="true">
            {a.mode === mode ? "▶" : ""}
          </span>
          {lang === "en" ? a.en : a.pt}
        </button>
      ))}
    </nav>
  );
  const nomeDoModo = ABAS.find((a) => a.mode === mode);
  const titulo = (lang === "en" ? nomeDoModo?.en : nomeDoModo?.pt) ?? "Quiz";

  return mode === "diario" ? (
    <DesafioDoDia modos={modos} titulo={titulo} />
  ) : (
    <Livre key={mode} mode={mode} modos={modos} titulo={titulo} />
  );
};

interface TelaProps {
  modos: ReactNode;
  titulo: string;
  /** O que fica na tela da esquerda, abaixo dos modos (recorte, placar). */
  lateral?: ReactNode;
  children: ReactNode;
}

/** As duas telas do quiz: modos e placar à esquerda, a rodada à direita. */
const Tela = ({ modos, titulo, lateral, children }: TelaProps) => {
  const lang = useLang();
  return (
    <Panes
      leftLabel={tr(lang, "Modos e placar", "Modes and score")}
      rightLabel={tr(lang, "Rodada", "Round")}
      left={
        <>
          <div className="pane-bar">
            <h2 className="pane-h">{tr(lang, "QUEM E ESSE POKEMON?", "WHO'S THAT POKEMON?")}</h2>
          </div>
          <div className="pane-scroll">
            {modos}
            {lateral}
          </div>
        </>
      }
      right={
        <>
          <header className="pane-band">
            <span className="px">QUIZ</span>
            <h2>{titulo}</h2>
          </header>
          <div className="pane-scroll pane-scroll-loose quiz-palco-pane">{children}</div>
        </>
      }
    />
  );
};

/** Rodadas sem fim num modo, com sequência e recorde. */
const Livre = ({ mode, modos, titulo }: { mode: RoundMode; modos: ReactNode; titulo: string }) => {
  const [params, setParams] = useSearchParams();
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const gen = parseQuizGen(params.get("ger"));
  const pool = useMemo(() => poolFor(gen), [gen]);
  // O recorde é por modo: acertar tipo e acertar silhueta são jogos diferentes.
  const chave = mode === "silhueta" ? gen : `${mode}-${gen}`;

  const [round, setRound] = useState<Round>(() => makeRound(pool, Math.random));
  const [respondida, setRespondida] = useState(false);
  const [sequencia, setSequencia] = useState(0);
  const [recorde, setRecorde] = useState(() => loadBest(chave));
  const [placar, setPlacar] = useState({ acertos: 0, total: 0 });

  const trocarRecorte = (g: QuizGen) => {
    const p = new URLSearchParams(params);
    if (g === "all") p.delete("ger");
    else p.set("ger", String(g));
    setParams(p, { replace: true });
    setRound(makeRound(poolFor(g), Math.random));
    setRespondida(false);
    setSequencia(0);
    setRecorde(loadBest(mode === "silhueta" ? g : `${mode}-${g}`));
    setPlacar({ acertos: 0, total: 0 });
  };

  const resolver = (acertou: boolean) => {
    setRespondida(true);
    setPlacar((p) => ({ acertos: p.acertos + (acertou ? 1 : 0), total: p.total + 1 }));
    if (acertou) {
      const nova = sequencia + 1;
      setSequencia(nova);
      if (nova > recorde) {
        setRecorde(nova);
        saveBest(chave, nova);
      }
    } else {
      setSequencia(0);
    }
  };

  const proximo = useCallback(() => {
    setRound((r) => makeRound(pool, Math.random, r.answer));
    setRespondida(false);
  }, [pool]);

  return (
    <Tela
      modos={modos}
      titulo={titulo}
      lateral={
        <>
      <label className="quiz-recorte">
        <span>{t("Gerações", "Generations")}</span>
        <select value={String(gen)} onChange={(e) => trocarRecorte(parseQuizGen(e.target.value))}>
          <option value="all">{t("Todas", "All")}</option>
          {GEN_RANGES.map((_, i) => (
            <option key={i} value={i + 1}>
              {generationLabel(i + 1, lang)}
            </option>
          ))}
        </select>
      </label>

      <dl className="quiz-placar">
        <div>
          <dt>{t("Sequência", "Streak")}</dt>
          <dd>{sequencia}</dd>
        </div>
        <div>
          <dt>{t("Recorde", "Best")}</dt>
          <dd>{recorde}</dd>
        </div>
        <div>
          <dt>{t("Nesta visita", "This visit")}</dt>
          <dd>
            {placar.acertos}/{placar.total}
          </dd>
        </div>
      </dl>
        </>
      }
    >
      <Rodada key={round.answer} mode={mode} round={round} onResolve={resolver} />
      {respondida && <Depois answer={round.answer} onNext={proximo} />}
    </Tela>
  );
};

/** "Próximo" e o link para a ficha. Enter e espaço também avançam. */
const Depois = ({ answer, onNext, label }: { answer: number; onNext: () => void; label?: string }) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { slugOf } = useNomes();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "Enter" || e.key === " ") {
        // O botão focado já trata o Enter; aqui é para quando o foco está fora.
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);
  return (
    <div className="quiz-depois">
      <button type="button" className="quiz-proximo" onClick={onNext} autoFocus>
        {label ?? t("Próximo →", "Next →")}
      </button>
      {slugOf.get(answer) && <Link to={`/pokemon/${slugOf.get(answer)}`}>{t("Ver a ficha", "See the profile")}</Link>}
    </div>
  );
};

interface RodadaProps {
  mode: RoundMode;
  round: Round;
  onResolve: (acertou: boolean) => void;
}

/** Uma pergunta: o palco do modo, as quatro alternativas e a revelação. */
const Rodada = ({ mode, round, onResolve }: RodadaProps) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const { pronto, nome } = useNomes();
  const { data: poke } = usePokemonDetail(String(round.answer));
  const { data: species } = usePokemonSpecies(mode === "descricao" ? poke?.species.url : undefined);
  const [escolha, setEscolha] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);

  const ptFlavor = usePtFlavor();

  const tiposCertos = useMemo(
    () => (poke ? [...poke.types].sort((a, b) => a.slot - b.slot).map((x) => x.type.name) : undefined),
    [poke]
  );
  const opcoes: { key: string; label: ReactNode; certa: boolean }[] = useMemo(() => {
    if (mode === "tipo") {
      if (!tiposCertos) return [];
      const certa = tiposCertos.join("/");
      // Semente fixa por rodada: as alternativas não mudam a cada render.
      return typeOptions(tiposCertos, seededRandom(round.answer)).map((combo) => ({
        key: combo.join("/"),
        certa: combo.join("/") === certa,
        label: (
          <span className="quiz-tipos">
            {combo.map((ty) => (
              <span key={ty} className="card-type-dot card-type-dot-lg" data-type={ty}>
                {tType(ty)}
              </span>
            ))}
          </span>
        ),
      }));
    }
    return round.options.map((id) => ({ key: String(id), certa: id === round.answer, label: nome(id) }));
  }, [mode, tiposCertos, round, nome]);

  // Sem os nomes, o botão mostraria "#25" — e o número entrega a resposta.
  const podeResponder = mode === "tipo" ? opcoes.length > 0 : pronto;
  const revelado = escolha !== null;
  const acertou = opcoes.find((o) => o.key === escolha)?.certa ?? false;

  const responder = useCallback(
    (key: string) => {
      if (escolha !== null) return;
      setEscolha(key);
      onResolve(opcoes.find((o) => o.key === key)?.certa ?? false);
    },
    [escolha, onResolve, opcoes]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (escolha === null && podeResponder && n >= 1 && n <= opcoes.length) {
        e.preventDefault();
        responder(opcoes[n - 1].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escolha, podeResponder, opcoes, responder]);

  const grito = poke?.cries?.latest ?? poke?.cries?.legacy ?? null;
  // O grito toca sozinho quando a rodada abre — se o navegador deixar.
  useEffect(() => {
    if (mode === "grito" && grito) audio.current?.play().catch(() => undefined);
  }, [mode, grito]);

  const texto = useMemo(() => {
    if (mode !== "descricao" || !species) return "";
    const bruto = ptFlavor?.[species.id] || pickLocalized(species.flavor_text_entries, (e) => e.flavor_text, lang);
    return redactName(bruto, [species.name, ...(species.names ?? []).map((n) => n.name)]);
  }, [mode, species, lang, ptFlavor]);

  const sprite = (silhueta: boolean) => (
    <img
      src={pixelSpriteUrl(round.answer)}
      alt={revelado ? nome(round.answer) : silhueta ? t("Silhueta de um pokémon", "Silhouette of a Pokémon") : ""}
      width={96}
      height={96}
      className={`quiz-sprite${silhueta ? "" : " quiz-sprite-visivel"}`}
      draggable={false}
    />
  );

  return (
    <>
      <div className={`quiz-palco${revelado ? " is-revelado" : ""}`}>
        {mode === "silhueta" && sprite(true)}
        {mode === "grito" &&
          (revelado ? (
            sprite(false)
          ) : (
            <div className="quiz-grito">
              <audio ref={audio} src={grito ?? undefined} preload="auto" />
              <button type="button" onClick={() => audio.current?.play().catch(() => undefined)} disabled={!grito}>
                ▶ {grito ? t("Ouvir o grito", "Play the cry") : t("Carregando…", "Loading…")}
              </button>
            </div>
          ))}
        {mode === "descricao" &&
          (revelado ? (
            sprite(false)
          ) : (
            <blockquote className="quiz-descricao">{texto || t("Carregando…", "Loading…")}</blockquote>
          ))}
        {mode === "tipo" && (
          <>
            {sprite(false)}
            <p className="quiz-pergunta">
              {t("Qual é o tipo de", "What type is")} <strong>{nome(round.answer)}</strong>?
            </p>
          </>
        )}
        <p className="quiz-resultado" role="status" aria-live="polite">
          {revelado &&
            (mode === "tipo" ? (
              acertou ? (
                t("Isso!", "Right!")
              ) : (
                <>
                  {t("Era", "It was")} <strong>{tiposCertos?.map((ty) => tType(ty)).join(" / ")}</strong>.
                </>
              )
            ) : acertou ? (
              <>
                {t("É o", "It's")} <strong>{nome(round.answer)}</strong>!
              </>
            ) : (
              <>
                {t("Era o", "It was")} <strong>{nome(round.answer)}</strong>.
              </>
            ))}
        </p>
      </div>

      <div className="quiz-opcoes">
        {opcoes.length === 0
          ? [0, 1, 2, 3].map((i) => (
              <button key={i} type="button" className="quiz-opcao" disabled>
                <kbd>{i + 1}</kbd> …
              </button>
            ))
          : opcoes.map((o, i) => {
              const classe = revelado && o.certa ? " is-certa" : revelado && o.key === escolha ? " is-errada" : "";
              return (
                <button
                  key={o.key}
                  type="button"
                  className={`quiz-opcao${classe}`}
                  onClick={() => responder(o.key)}
                  disabled={revelado || !podeResponder}
                >
                  <kbd>{i + 1}</kbd> {podeResponder ? o.label : "…"}
                </button>
              );
            })}
      </div>
    </>
  );
};

/** Cinco rodadas, iguais para todo mundo hoje; uma tentativa por dia. */
const DesafioDoDia = ({ modos, titulo }: { modos: ReactNode; titulo: string }) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const dia = useMemo(() => dayNumber(new Date()), []);
  const rodadas = useMemo(() => dailyRounds(dia), [dia]);
  const [resultados, setResultados] = useState<boolean[]>(() => loadDaily(dia) ?? []);
  const [respondida, setRespondida] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const i = respondida ? resultados.length - 1 : resultados.length;
  const acabou = !respondida && resultados.length >= DAILY_ROUNDS;

  const resolver = (acertou: boolean) => {
    const novos = [...resultados, acertou];
    setResultados(novos);
    saveDaily(dia, novos);
    setRespondida(true);
  };

  if (acabou) {
    const texto = shareText(dia, resultados, lang);
    return (
      <Tela modos={modos} titulo={titulo}>
      <section className="quiz-fim" aria-labelledby="quiz-fim-titulo">
        <h2 id="quiz-fim-titulo">
          {resultados.filter(Boolean).length}/{DAILY_ROUNDS}
        </h2>
        <p className="quiz-quadrados" aria-label={t("Acertos e erros, em ordem", "Hits and misses, in order")}>
          {resultados.map((r, k) => (
            <span key={k} role="img" aria-label={r ? t("acerto", "hit") : t("erro", "miss")}>
              {r ? "🟩" : "🟥"}
            </span>
          ))}
        </p>
        <pre className="quiz-compartilhar">{texto}</pre>
        <button
          type="button"
          className="quiz-proximo"
          onClick={() => {
            navigator.clipboard
              ?.writeText(texto)
              .then(() => setCopiado(true))
              .catch(() => setCopiado(false));
          }}
        >
          {copiado ? t("Copiado ✓", "Copied ✓") : t("Copiar resultado", "Copy result")}
        </button>
        <p className="quiz-resultado">{t("Um desafio novo amanhã.", "A new challenge tomorrow.")}</p>
      </section>
      </Tela>
    );
  }

  const atual = rodadas[i];
  const nomeDoModo = ABAS.find((a) => a.mode === atual.mode);
  return (
    <Tela
      modos={modos}
      titulo={titulo}
      lateral={
      <p className="quiz-progresso">
        {t("Rodada", "Round")} {i + 1}/{DAILY_ROUNDS} · {lang === "en" ? nomeDoModo?.en : nomeDoModo?.pt}
        <span aria-hidden="true">
          {" "}
          {resultados.map((r) => (r ? "🟩" : "🟥")).join("")}
        </span>
      </p>
      }
    >
      <Rodada key={i} mode={atual.mode} round={atual.round} onResolve={resolver} />
      {respondida && (
        <Depois
          answer={atual.round.answer}
          onNext={() => setRespondida(false)}
          label={i + 1 >= DAILY_ROUNDS ? t("Ver resultado →", "See result →") : undefined}
        />
      )}
    </Tela>
  );
};

export default QuizPage;
