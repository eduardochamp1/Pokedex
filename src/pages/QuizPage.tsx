import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePokemonIndex } from "../hooks/usePokemon";
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
import "../styles/quiz.css";

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/**
 * "Quem é esse Pokémon?" — a silhueta é o sprite local com o brilho zerado
 * por CSS; revelar é tirar o filtro. O recorte fica na URL (`?ger=3`).
 */
const QuizPage = () => {
  const [params, setParams] = useSearchParams();
  const gen = parseQuizGen(params.get("ger"));
  const pool = useMemo(() => poolFor(gen), [gen]);

  const { index } = usePokemonIndex();
  /** Número nacional -> slug; a primeira entrada do índice é a espécie base. */
  const slugOf = useMemo(() => {
    const m = new Map<number, string>();
    for (const [name, id] of index ?? []) if (!m.has(id)) m.set(id, name);
    return m;
  }, [index]);

  const [round, setRound] = useState<Round>(() => makeRound(pool, Math.random));
  const [escolha, setEscolha] = useState<number | null>(null);
  const [sequencia, setSequencia] = useState(0);
  const [recorde, setRecorde] = useState(() => loadBest(gen));
  const [placar, setPlacar] = useState({ acertos: 0, total: 0 });

  const trocarRecorte = (g: QuizGen) => {
    const p = new URLSearchParams(params);
    if (g === "all") p.delete("ger");
    else p.set("ger", String(g));
    setParams(p, { replace: true });
    setRound(makeRound(poolFor(g), Math.random));
    setEscolha(null);
    setSequencia(0);
    setRecorde(loadBest(g));
    setPlacar({ acertos: 0, total: 0 });
  };

  const responder = useCallback(
    (id: number) => {
      if (escolha !== null) return;
      setEscolha(id);
      const acertou = id === round.answer;
      setPlacar((p) => ({ acertos: p.acertos + (acertou ? 1 : 0), total: p.total + 1 }));
      if (acertou) {
        const nova = sequencia + 1;
        setSequencia(nova);
        if (nova > recorde) {
          setRecorde(nova);
          saveBest(gen, nova);
        }
      } else {
        setSequencia(0);
      }
    },
    [escolha, round.answer, sequencia, recorde, gen]
  );

  const proximo = useCallback(() => {
    setRound((r) => makeRound(pool, Math.random, r.answer));
    setEscolha(null);
  }, [pool]);

  // 1–4 respondem; Enter ou espaço vão para a próxima depois de responder.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (escolha === null && index && n >= 1 && n <= round.options.length) {
        e.preventDefault();
        responder(round.options[n - 1]);
      } else if (escolha !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        proximo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escolha, index, round.options, responder, proximo]);

  const nome = (id: number) => {
    const slug = slugOf.get(id);
    return slug ? pokemonLabel(slug) : `#${id}`;
  };
  const revelado = escolha !== null;
  const acertou = escolha === round.answer;

  return (
    <div className="quiz-shell">
      <header className="quiz-header">
        <h1>Quem é esse Pokémon?</h1>
        <label className="quiz-recorte">
          <span>Gerações</span>
          <select
            value={String(gen)}
            onChange={(e) => trocarRecorte(parseQuizGen(e.target.value))}
          >
            <option value="all">Todas</option>
            {GEN_RANGES.map((_, i) => (
              <option key={i} value={i + 1}>
                Geração {ROMANOS[i]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <dl className="quiz-placar">
        <div>
          <dt>Sequência</dt>
          <dd>{sequencia}</dd>
        </div>
        <div>
          <dt>Recorde</dt>
          <dd>{recorde}</dd>
        </div>
        <div>
          <dt>Nesta visita</dt>
          <dd>
            {placar.acertos}/{placar.total}
          </dd>
        </div>
      </dl>

      <div className={`quiz-palco${revelado ? " is-revelado" : ""}`}>
        <img
          key={round.answer}
          src={pixelSpriteUrl(round.answer)}
          alt={revelado ? nome(round.answer) : "Silhueta de um pokémon"}
          width={96}
          height={96}
          className="quiz-sprite"
          draggable={false}
        />
        <p className="quiz-resultado" role="status" aria-live="polite">
          {revelado &&
            (acertou ? (
              <>
                É o <strong>{nome(round.answer)}</strong>!
              </>
            ) : (
              <>
                Era o <strong>{nome(round.answer)}</strong>.
              </>
            ))}
        </p>
      </div>

      <div className="quiz-opcoes">
        {round.options.map((id, i) => {
          const classe =
            revelado && id === round.answer
              ? " is-certa"
              : revelado && id === escolha
                ? " is-errada"
                : "";
          return (
            <button
              key={id}
              type="button"
              className={`quiz-opcao${classe}`}
              onClick={() => responder(id)}
              // Sem o índice, o botão mostraria "#25" — e o número entrega a resposta.
              disabled={revelado || !index}
            >
              <kbd>{i + 1}</kbd> {index ? nome(id) : "…"}
            </button>
          );
        })}
      </div>

      {revelado && (
        <div className="quiz-depois">
          <button type="button" className="quiz-proximo" onClick={proximo} autoFocus>
            Próximo →
          </button>
          {slugOf.get(round.answer) && (
            <Link to={`/pokemon/${slugOf.get(round.answer)}`}>Ver a ficha</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
