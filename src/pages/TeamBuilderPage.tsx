import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { usePokemonIndex, usePokemonsByNames } from "../hooks/usePokemon";
import { useTrainerEntry } from "../lib/trainerLog";
import { namesForIds } from "../lib/filters";
import { tType } from "../data/i18n";
import { multiplierLabel } from "../lib/typeDefense";
import {
  MAX_TEAM,
  defenseTable,
  offenseCoverage,
  parseTeamParam,
  teamGaps,
  toTeamParam,
  type TeamMember,
} from "../lib/teamAnalysis";
import type { TypeName } from "../data/typeMatchups";
import "../styles/team.css";

const TypeDot = ({ type }: { type: TypeName }) => (
  <span className="card-type-dot-lg" data-type={type}>
    {tType(type)}
  </span>
);

/** Tom da célula: fraco (>1), resiste (<1), imune (0) ou neutro. */
function tomDe(m: number): string {
  if (m === 0) return "is-immune";
  if (m > 1) return "is-weak";
  if (m < 1) return "is-resist";
  return "";
}

/**
 * Montador de time: até seis pokémon, e o que o time aguenta e o que ele
 * acerta. O time fica na URL (`?time=`), então dá para mandar o link.
 */
const TeamBuilderPage = () => {
  const [params, setParams] = useSearchParams();
  const names = parseTeamParam(params.get("time"));
  const setNames = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("time", toTeamParam(next));
    else p.delete("time");
    setParams(p, { replace: true });
  };

  const { index } = usePokemonIndex();
  const sugestoes = useMemo(() => (index ? [...index.keys()] : []), [index]);
  const { pokemons, isLoading } = usePokemonsByNames(names);

  const [entrada, setEntrada] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const adicionar = () => {
    const nome = entrada.trim().toLowerCase();
    if (!nome) return;
    const porId = /^\d+$/.test(nome) && index ? namesForIds([Number(nome)], index)[0] : undefined;
    const final = porId ?? nome;
    if (index && !index.has(final)) {
      setAviso(`Não achei "${entrada.trim()}".`);
      return;
    }
    if (names.includes(final)) {
      setAviso(`${final} já está no time.`);
      return;
    }
    setAviso(null);
    setNames([...names, final]);
    setEntrada("");
  };

  // O time do save de Emerald, quando /jogar já leu um.
  const treinador = useTrainerEntry();
  const doSave = useMemo(
    () =>
      treinador && index
        ? namesForIds(
            treinador.party.map((m) => m.national),
            index
          )
        : [],
    [treinador, index]
  );

  const membros: TeamMember[] = pokemons
    .filter(Boolean)
    .map((p) => ({ name: p.name, types: p.types.map((t) => t.type.name as TypeName) }));
  const defesa = defenseTable(membros);
  const ataque = offenseCoverage(membros);
  const lacunas = teamGaps(membros);

  return (
    <div className="team-shell">
      <header className="team-header">
        <h1>Time</h1>
        <span className="team-count">
          {names.length} / {MAX_TEAM}
        </span>
      </header>

      <form
        className="team-add"
        onSubmit={(e) => {
          e.preventDefault();
          adicionar();
        }}
      >
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Nome ou número"
          aria-label="Pokémon para adicionar ao time"
          list="team-names"
          disabled={names.length >= MAX_TEAM}
        />
        <datalist id="team-names">
          {sugestoes.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button type="submit" disabled={names.length >= MAX_TEAM || !entrada.trim()}>
          Adicionar
        </button>
        {doSave.length > 0 && (
          <button type="button" className="team-secundario" onClick={() => setNames(doSave)}>
            Usar o time do save ({treinador?.playerName})
          </button>
        )}
        {names.length > 0 && (
          <button type="button" className="team-secundario" onClick={() => setNames([])}>
            Limpar
          </button>
        )}
      </form>
      {aviso && (
        <p className="team-aviso" role="status">
          {aviso}
        </p>
      )}

      {names.length === 0 ? (
        <p className="team-vazio">
          Adicione até seis pokémon para ver o que o time aguenta e o que ele acerta.
        </p>
      ) : (
        <>
          <ul className="team-slots">
            {names.map((nome, i) => {
              const p = pokemons[i];
              return (
                <li key={nome}>
                  {p ? (
                    <Card pokemon={p} variant="mini" linkTo={`/pokemon/${p.name}`} />
                  ) : (
                    <div className="team-slot-vazio">{isLoading ? "…" : nome}</div>
                  )}
                  <button
                    type="button"
                    className="team-remover"
                    onClick={() => setNames(names.filter((n) => n !== nome))}
                    aria-label={`Tirar ${nome} do time`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>

          {membros.length > 0 && (
            <>
              <section className="team-resumo" aria-label="Resumo">
                <div>
                  <h2>Pontos fracos</h2>
                  {lacunas.weakSpots.length === 0 ? (
                    <p className="team-ok">Nenhum tipo pega o time desprevenido.</p>
                  ) : (
                    <p className="team-tipos">
                      {lacunas.weakSpots.map((t) => (
                        <TypeDot key={t} type={t} />
                      ))}
                    </p>
                  )}
                </div>
                <div>
                  <h2>Ninguém acerta forte</h2>
                  {lacunas.uncovered.length === 0 ? (
                    <p className="team-ok">Algum tipo do time acerta 2× em todos os 18.</p>
                  ) : (
                    <p className="team-tipos">
                      {lacunas.uncovered.map((t) => (
                        <TypeDot key={t} type={t} />
                      ))}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h2>Defesa</h2>
                <p className="team-nota">
                  Quanto cada tipo de golpe causa em cada membro. Linha marcada: dois ou
                  mais fracos, e mais fracos do que quem resiste.
                </p>
                <div className="team-tabela-wrap">
                  <table className="team-tabela">
                    <thead>
                      <tr>
                        <th scope="col">Golpe</th>
                        {membros.map((m) => (
                          <th key={m.name} scope="col">
                            {m.name}
                          </th>
                        ))}
                        <th scope="col">Fracos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defesa.map((r) => (
                        <tr key={r.attacker} className={r.danger ? "is-danger" : undefined}>
                          <th scope="row">
                            <TypeDot type={r.attacker} />
                          </th>
                          {membros.map((m) => {
                            const mult = r.byMember[m.name] ?? 1;
                            return (
                              <td key={m.name} className={tomDe(mult)}>
                                {mult === 1 ? "" : multiplierLabel(mult)}
                              </td>
                            );
                          })}
                          <td>{r.weak.length || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2>Ataque</h2>
                <p className="team-nota">
                  Contando só os tipos de cada membro, como se usassem golpes do próprio
                  tipo.
                </p>
                <ul className="team-ataque">
                  {ataque.map((r) => (
                    <li key={r.defender} className={r.best >= 2 ? "is-covered" : "is-gap"}>
                      <TypeDot type={r.defender} />
                      <span className="team-ataque-quem">
                        {r.by.length ? r.by.join(", ") : `melhor: ${multiplierLabel(r.best)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TeamBuilderPage;
