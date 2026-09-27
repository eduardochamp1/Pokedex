import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMoveDetails, usePokemonIndex, usePokemonsByNames } from "../hooks/usePokemon";
import { useTrainerEntry } from "../lib/trainerLog";
import { namesForIds } from "../lib/filters";
import { moveSlugById } from "../lib/teamSheet";
import { gen3MoveData, gen3PokemonTypes } from "../lib/gen3Damage";
import { nextGym, rankForGym, type BattleMember } from "../lib/gymGuide";
import { EMERALD_GYMS, FRLG_GYMS, type Gym } from "../data/gymLeaders";
import { badgesOf } from "../lib/gen3Game";
import { prettyMoveName } from "../lib/moves";
import { pokemonLabel } from "../lib/pokemonLabel";
import { tType } from "../data/i18n";
import PokemonMini from "../components/PokemonMini";
import { useLang, tr } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/gyms.css";

type Jogo = "emerald" | "frlg";

/** O seu time do save como `BattleMember`: tipos e golpes de Gen 3. */
function useMeuTime(): BattleMember[] {
  const entry = useTrainerEntry();
  const team = useMemo(() => entry?.team ?? [], [entry]);
  const { index } = usePokemonIndex();
  const nomes = useMemo(() => (index ? namesForIds(team.map((m) => m.national), index) : []), [team, index]);
  const { pokemons } = usePokemonsByNames(nomes);

  // Golpe que a espécie não lista vai pelo número: /move/{id} também responde.
  // `pokemons` sai filtrado enquanto carrega: casar pelo número, não pela posição.
  const especie = (national: number) => pokemons.find((p) => p.id === national);
  const chaves = team.map((m) => {
    const p = especie(m.national);
    return m.moves.map((mv) => (p ? moveSlugById(p.moves, mv.id) : undefined) ?? String(mv.id));
  });
  const golpes = useMoveDetails([...new Set(chaves.flat())]);

  return team.flatMap((m, i) => {
    const p = especie(m.national);
    if (!p) return [];
    return [
      {
        name: m.nickname,
        national: m.national,
        level: m.level,
        types: gen3PokemonTypes(p),
        moves: chaves[i].flatMap((k) => {
          const d = golpes[k];
          if (!d) return [];
          const g = gen3MoveData(d);
          return [{ slug: d.name, type: g.type, power: g.power }];
        }),
      },
    ];
  });
}

const mult = (m: number | null) => (m === null ? "—" : `×${String(m).replace(".", ",")}`);
const classe = (m: number | null, bom: boolean) =>
  m === null || m === 1 ? undefined : (m > 1) === bom ? "gym-bom" : "gym-ruim";

/**
 * Os oito ginásios do seu jogo: o time de cada líder como a decompilação
 * define, e o seu time do save contra ele.
 */
const GymsPage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const entry = useTrainerEntry();
  const [escolhido, setEscolhido] = useState<Jogo | null>(null);
  const jogo: Jogo = escolhido ?? (entry?.game === "frlg" ? "frlg" : "emerald");
  const gyms = jogo === "frlg" ? FRLG_GYMS : EMERALD_GYMS;
  const insignias = badgesOf(jogo);
  const doSave = entry && (entry.game ?? "emerald") === jogo ? entry.trainer.badges : null;
  const proximo = nextGym(doSave);
  const meuTime = useMeuTime();

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Ginásios", "Gyms")}</h1>
        <label className="trainer-sub">
          {t("Jogo", "Game")}{" "}
          <select value={jogo} onChange={(e) => setEscolhido(e.target.value as Jogo)}>
            <option value="emerald">Emerald</option>
            <option value="frlg">FireRed/LeafGreen</option>
          </select>
        </label>
      </header>
      <p className="trainer-sub">
        {t(
          "Times tirados da decompilação (pret/pokeemerald e pret/pokefirered): a primeira luta de cada líder. Ruby/Sapphire têm times um pouco diferentes.",
          "Teams taken from the decompilation (pret/pokeemerald and pret/pokefirered): each leader's first battle. Ruby/Sapphire have slightly different teams."
        )}{" "}
        {meuTime.length === 0 && (
          <>
            {t("Com um save lido em", "With a save read in")} <Link to="/jogar">{t("Jogar", "Play")}</Link>,{" "}
            {t("o seu time aparece contra cada líder.", "your team shows up against each leader.")}
          </>
        )}
      </p>

      <ol className="gyms">
        {gyms.map((g, i) => (
          <GymCard
            key={g.leader}
            gym={g}
            badge={insignias[i]?.name ?? ""}
            ganho={doSave?.[i] ?? false}
            proximo={doSave !== null && proximo === i}
            meuTime={meuTime}
          />
        ))}
      </ol>
    </div>
  );
};

interface CardProps {
  gym: Gym;
  badge: string;
  ganho: boolean;
  proximo: boolean;
  meuTime: BattleMember[];
}

const GymCard = ({ gym, badge, ganho, proximo, meuTime }: CardProps) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const ranking = meuTime.length ? rankForGym(meuTime, gym) : [];
  // A ordem das colunas é a do time; o ranking só escolhe quem destacar.
  const destaque = ranking[0]?.member.name;

  return (
    <li className={`gym${proximo ? " gym-proximo" : ""}`}>
      <details open={proximo}>
        <summary>
          <span className="card-type-dot card-type-dot-lg" data-type={gym.type}>
            {tType(gym.type)}
          </span>
          <strong>{gym.leader}</strong>
          <span className="trainer-sub">
            {gym.city} · {badge}
          </span>
          {ganho && <span className="gym-ganho">✓ {t("insígnia", "badge")}</span>}
          {proximo && <span className="gym-ganho">{t("próximo", "next")}</span>}
        </summary>

        <div className="gym-corpo">
          {ranking.length > 0 && (
            <p>
              {t("Melhor escolha pelo tipo:", "Best pick by type:")} <strong>{destaque}</strong>
              {ranking[1] && ranking[1].score > 0 && (
                <>
                  {t(", depois ", ", then ")}
                  <strong>{ranking[1].member.name}</strong>
                </>
              )}
            </p>
          )}
          <div className="gym-tabela-rolagem">
            <table className="gym-tabela">
              <thead>
                <tr>
                  <th scope="col">{t("Time do líder", "Leader's team")}</th>
                  {meuTime.map((m) => (
                    <th scope="col" key={m.name + m.national} className={m.name === destaque ? "gym-destaque" : undefined}>
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gym.party.map((mon, j) => (
                  <tr key={j}>
                    <th scope="row">
                      <div className="gym-mon">
                        <PokemonMini id={mon.national} label={pokemonLabel(mon.species)} sub={`${t("nv", "lv")} ${mon.level}`} slug={mon.species} />
                        <div>
                          <p className="gym-tipos">
                            {mon.types.map((ty) => (
                              <span key={ty} className="card-type-dot card-type-dot-lg" data-type={ty}>
                                {tType(ty)}
                              </span>
                            ))}
                          </p>
                          <p className="trainer-sub">{mon.moves.map((mv) => prettyMoveName(mv.slug)).join(" · ")}</p>
                          <p className="trainer-sub">
                            IV {mon.iv}
                            {mon.item ? ` · ${prettyMoveName(mon.item)}` : ""}
                          </p>
                        </div>
                      </div>
                    </th>
                    {ranking.length > 0 &&
                      meuTime.map((m) => {
                        const r = ranking.find((x) => x.member === m)!.matchups[j];
                        return (
                          <td key={m.name + m.national}>
                            <span className={classe(r.offense.mult, true)} title={r.offense.move ? prettyMoveName(r.offense.move) : undefined}>
                              {t("bate", "hits")} {mult(r.offense.mult)}
                              {r.offense.move && <span className="gym-golpe"> {prettyMoveName(r.offense.move)}</span>}
                            </span>
                            <span className={classe(r.defense.mult, false)}>
                              {t("apanha", "takes")} {mult(r.defense.mult)}
                              {r.defense.move && <span className="gym-golpe"> {prettyMoveName(r.defense.move)}</span>}
                            </span>
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </li>
  );
};

export default GymsPage;
