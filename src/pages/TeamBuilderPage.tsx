import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import TeamSuggestions from "../components/TeamSuggestions";
import { usePokemonIndex, usePokemonsByNames } from "../hooks/usePokemon";
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
import { useLang, tr } from "../i18n/lang";

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
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
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
      setAviso(t(`Não achei "${entrada.trim()}".`, `Couldn't find "${entrada.trim()}".`));
      return;
    }
    if (names.includes(final)) {
      setAviso(t(`${final} já está no time.`, `${final} is already on the team.`));
      return;
    }
    setAviso(null);
    setNames([...names, final]);
    setEntrada("");
  };

  const membros: TeamMember[] = pokemons
    .filter(Boolean)
    .map((p) => ({ name: p.name, types: p.types.map((t) => t.type.name as TypeName) }));
  const defesa = defenseTable(membros);
  const ataque = offenseCoverage(membros);
  const lacunas = teamGaps(membros);

  return (
    <div className="team-shell">
      <header className="team-header">
        <h1>{t("Time", "Team")}</h1>
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
          placeholder={t("Nome ou número", "Name or number")}
          aria-label={t("Pokémon para adicionar ao time", "Pokémon to add to the team")}
          list="team-names"
          disabled={names.length >= MAX_TEAM}
        />
        <datalist id="team-names">
          {sugestoes.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button type="submit" disabled={names.length >= MAX_TEAM || !entrada.trim()}>
          {t("Adicionar", "Add")}
        </button>
        {names.length > 0 && (
          <button type="button" className="team-secundario" onClick={() => setNames([])}>
            {t("Limpar", "Clear")}
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
          {t(
            "Adicione até seis pokémon para ver o que o time aguenta e o que ele acerta.",
            "Add up to six Pokémon to see what the team can take and what it hits hard."
          )}
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
                    aria-label={t(`Tirar ${nome} do time`, `Remove ${nome} from the team`)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>

          {membros.length > 0 && (
            <>
              <section className="team-resumo" aria-label={t("Resumo", "Summary")}>
                <div>
                  <h2>{t("Pontos fracos", "Weak spots")}</h2>
                  {lacunas.weakSpots.length === 0 ? (
                    <p className="team-ok">{t("Nenhum tipo pega o time desprevenido.", "No type catches the team off guard.")}</p>
                  ) : (
                    <p className="team-tipos">
                      {lacunas.weakSpots.map((t) => (
                        <TypeDot key={t} type={t} />
                      ))}
                    </p>
                  )}
                </div>
                <div>
                  <h2>{t("Ninguém acerta forte", "Nobody hits hard")}</h2>
                  {lacunas.uncovered.length === 0 ? (
                    <p className="team-ok">{t("Algum tipo do time acerta 2× em todos os 18.", "Some type on the team hits all 18 for 2×.")}</p>
                  ) : (
                    <p className="team-tipos">
                      {lacunas.uncovered.map((t) => (
                        <TypeDot key={t} type={t} />
                      ))}
                    </p>
                  )}
                </div>
              </section>

              {names.length < MAX_TEAM && (
                <TeamSuggestions
                  membros={membros}
                  index={index}
                  onAdd={(n) => {
                    if (!names.includes(n)) setNames([...names, n]);
                  }}
                />
              )}

              <section>
                <h2>{t("Defesa", "Defense")}</h2>
                <p className="team-nota">
                  {t(
                    "Quanto cada tipo de golpe causa em cada membro. Linha marcada: dois ou mais fracos, e mais fracos do que quem resiste.",
                    "How much each move type deals to each member. Marked row: two or more weak members, and more weak than resistant ones."
                  )}
                </p>
                <div className="team-tabela-wrap">
                  <table className="team-tabela">
                    <thead>
                      <tr>
                        <th scope="col">{t("Golpe", "Move")}</th>
                        {membros.map((m) => (
                          <th key={m.name} scope="col">
                            {m.name}
                          </th>
                        ))}
                        <th scope="col">{t("Fracos", "Weak")}</th>
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
                <h2>{t("Ataque", "Offense")}</h2>
                <p className="team-nota">
                  {t(
                    "Contando só os tipos de cada membro, como se usassem golpes do próprio tipo.",
                    "Counting only each member's types, as if they used moves of their own type."
                  )}
                </p>
                <ul className="team-ataque">
                  {ataque.map((r) => (
                    <li key={r.defender} className={r.best >= 2 ? "is-covered" : "is-gap"}>
                      <TypeDot type={r.defender} />
                      <span className="team-ataque-quem">
                        {r.by.length ? r.by.join(", ") : `${t("melhor", "best")}: ${multiplierLabel(r.best)}`}
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
