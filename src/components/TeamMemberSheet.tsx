import type { Gen3PartyMember } from "../emulator/saveParse/gen3";
import type { Pokemon } from "../types/pokemon";
import { natureOf, type StatKey } from "../lib/gen3Stats";
import { abilityForGen3Slot, moveSlugById } from "../lib/teamSheet";
import { prettyMoveName } from "../lib/moves";
import "../styles/teamSheet.css";
import { useLang, tr } from "../i18n/lang";
import { statLabel } from "../i18n/common";

interface Props {
  membro: Gen3PartyMember;
  /** Da PokéAPI, para nomear habilidade e golpes. Sem ele, a ficha sai com números. */
  pokemon?: Pokemon;
  /** O PC abre a ficha já aberta: ela é o motivo do clique. */
  defaultOpen?: boolean;
}

/** Chave de gen3Stats -> slug da PokéAPI, que é o que statLabel conhece. */
const LINHAS: { key: StatKey; slug: string }[] = [
  { key: "hp", slug: "hp" },
  { key: "atk", slug: "attack" },
  { key: "def", slug: "defense" },
  { key: "spa", slug: "special-attack" },
  { key: "spd", slug: "special-defense" },
  { key: "spe", slug: "speed" },
];

const SLUG: Record<StatKey, string> = Object.fromEntries(
  LINHAS.map((l) => [l.key, l.slug])
) as Record<StatKey, string>;

const AMIZADE_MAX = 255;

/**
 * O que o save sabe de um pokémon do time e a carta não mostra: natureza,
 * IVs, EVs, golpes e amizade.
 *
 * É um `<details>` fechado por padrão. A carta continua sendo o rosto do time,
 * e a ficha é para quem quer abrir.
 */
const TeamMemberSheet = ({ membro, pokemon, defaultOpen }: Props) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const rotulo = (k: StatKey) => statLabel(SLUG[k], lang);
  const natureza = natureOf(membro.nature);
  const habilidade = pokemon ? abilityForGen3Slot(pokemon, membro.abilitySlot) : undefined;
  const totalEvs = LINHAS.reduce((s, l) => s + membro.evs[l.key], 0);

  return (
    <details className="team-sheet" open={defaultOpen}>
      <summary>{t("Ficha", "Details")}</summary>

      <dl className="team-sheet-fatos">
        {natureza && (
          <>
            <dt>{t("Natureza", "Nature")}</dt>
            <dd>
              {natureza.name}
              {natureza.up && natureza.down ? (
                <span className="team-sheet-efeito">
                  {" "}
                  +{rotulo(natureza.up)} −{rotulo(natureza.down)}
                </span>
              ) : (
                <span className="team-sheet-efeito"> {t("neutra", "neutral")}</span>
              )}
            </dd>
          </>
        )}
        {habilidade && (
          <>
            <dt>{t("Habilidade", "Ability")}</dt>
            <dd>{prettyMoveName(habilidade)}</dd>
          </>
        )}
        <dt>{t("Amizade", "Friendship")}</dt>
        <dd>
          {membro.friendship}
          <span className="team-sheet-efeito">
            {" "}
            {t("de", "of")} {AMIZADE_MAX}
          </span>
        </dd>
        {membro.shiny && (
          <>
            <dt>{t("Cor", "Color")}</dt>
            <dd>Shiny ✨</dd>
          </>
        )}
      </dl>

      <table className="team-sheet-status">
        <thead>
          <tr>
            <th scope="col">{t("Status", "Stat")}</th>
            <th scope="col">{t("Valor", "Value")}</th>
            <th scope="col">IV</th>
            <th scope="col">EV</th>
          </tr>
        </thead>
        <tbody>
          {LINHAS.map(({ key }) => {
            const sobe = natureza?.up === key;
            const desce = natureza?.down === key;
            return (
              <tr key={key}>
                <th scope="row">
                  {rotulo(key)}
                  {sobe && <span className="team-sheet-sobe" aria-label={t("natureza sobe", "nature raises")}> ▲</span>}
                  {desce && <span className="team-sheet-desce" aria-label={t("natureza desce", "nature lowers")}> ▼</span>}
                </th>
                <td>
                  {key === "hp" ? `${membro.stats.hp}/${membro.stats.maxHp}` : membro.stats[key]}
                </td>
                <td className={membro.ivs[key] === 31 ? "team-sheet-perfeito" : undefined}>
                  {membro.ivs[key]}
                </td>
                <td>{membro.evs[key]}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              {t("EVs somados", "Total EVs")}
            </th>
            <td>{totalEvs}/510</td>
          </tr>
        </tfoot>
      </table>

      {membro.moves.length > 0 && (
        <ul className="team-sheet-golpes">
          {membro.moves.map((m, i) => {
            const slug = pokemon ? moveSlugById(pokemon.moves, m.id) : undefined;
            return (
              <li key={i}>
                <span>{slug ? prettyMoveName(slug) : `${t("Golpe", "Move")} #${m.id}`}</span>
                <span className="team-sheet-pp">PP {m.pp}</span>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
};

export default TeamMemberSheet;
