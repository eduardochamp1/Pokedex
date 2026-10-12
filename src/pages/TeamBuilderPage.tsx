import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Panes } from "../components/device/Panes";
import { useDevicePage } from "../components/device/DeviceContext";
import RosterList from "../components/device/RosterList";
import TeamSuggestions from "../components/TeamSuggestions";
import { usePokemonIndex, usePokemonsByNames } from "../hooks/usePokemon";
import { pixelSpriteUrl } from "../lib/sprites";
import { pokemonLabel } from "../lib/pokemonLabel";
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
 *
 * À esquerda o elenco (tocar põe ou tira); à direita os seis slots e a análise.
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
  const { pokemons, isLoading } = usePokemonsByNames(names);
  const cheio = names.length >= MAX_TEAM;

  useDevicePage({
    labels: [t("ELENCO", "ROSTER"), t("TIME", "TEAM")],
    footer: `${names.length} / ${MAX_TEAM}`,
  });

  const alternar = (nome: string) => {
    if (names.includes(nome)) setNames(names.filter((n) => n !== nome));
    else if (!cheio) setNames([...names, nome]);
  };

  const membros: TeamMember[] = pokemons
    .filter(Boolean)
    .map((p) => ({ name: p.name, types: p.types.map((t) => t.type.name as TypeName) }));
  const defesa = defenseTable(membros);
  const ataque = offenseCoverage(membros);
  const lacunas = teamGaps(membros);

  return (
    <Panes
      leftLabel={t("Elenco", "Roster")}
      rightLabel={t("Time", "Team")}
      left={
        <>
          <div className="pane-bar">
            <div className="pane-bar-row">
              <h1 className="pane-h" style={{ flex: 1 }}>
                {t("MONTAR TIME", "BUILD TEAM")} · {names.length}/{MAX_TEAM}
              </h1>
              <button type="button" className="pane-btn" disabled={names.length === 0} onClick={() => setNames([])}>
                {t("LIMPAR", "CLEAR")}
              </button>
            </div>
          </div>
          <RosterList
            onPick={alternar}
            isOn={(n) => names.includes(n)}
            mark={(n) => (names.includes(n) ? "✓" : cheio ? "" : "+")}
          />
        </>
      }
      right={
        <>
          <header className="pane-band">
            <ul className="team-slots6">
              {Array.from({ length: MAX_TEAM }, (_, i) => {
                const nome = names[i];
                const p = nome ? pokemons[i] : undefined;
                return (
                  <li key={i}>
                    {nome ? (
                      <button
                        type="button"
                        onClick={() => setNames(names.filter((n) => n !== nome))}
                        aria-label={t(`Tirar ${nome} do time`, `Remove ${nome} from the team`)}
                        title={pokemonLabel(nome, lang)}
                      >
                        {p ? (
                          <img className="pixelated" src={pixelSpriteUrl(p.id)} width={72} height={72} alt="" />
                        ) : (
                          <span className="px">{isLoading ? "…" : "?"}</span>
                        )}
                      </button>
                    ) : (
                      <span className="team-slot6-vazio px" aria-hidden="true">
                        {i + 1}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {names.length > 0 && (
              <p className="team-slots6-nomes">
                {names.map((n, i) => (
                  <span key={n}>
                    {i > 0 && " · "}
                    <Link to={`/pokemon/${n}`}>{pokemonLabel(n, lang)}</Link>
                  </span>
                ))}
              </p>
            )}
          </header>
          <div className="pane-scroll pane-scroll-loose team-analise">
            {membros.length === 0 ? (
              <p className="pane-empty">
                {t("ESCOLHA ATE SEIS POKEMON", "PICK UP TO SIX POKEMON")}
                <br />
                {t("NO ELENCO", "FROM THE ROSTER")}
              </p>
            ) : (
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
          </div>
        </>
      }
    />
  );
};

export default TeamBuilderPage;
