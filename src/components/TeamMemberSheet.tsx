import type { Gen3PartyMember } from "../emulator/saveParse/gen3";
import type { Pokemon } from "../types/pokemon";
import { natureOf, type StatKey } from "../lib/gen3Stats";
import { abilityForGen3Slot, moveSlugById } from "../lib/teamSheet";
import { prettyMoveName } from "../lib/moves";
import "../styles/teamSheet.css";

interface Props {
  membro: Gen3PartyMember;
  /** Da PokéAPI, para nomear habilidade e golpes. Sem ele, a ficha sai com números. */
  pokemon?: Pokemon;
}

const LINHAS: { key: StatKey; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atq" },
  { key: "def", label: "Def" },
  { key: "spa", label: "Atq Esp" },
  { key: "spd", label: "Def Esp" },
  { key: "spe", label: "Vel" },
];

const ROTULO: Record<StatKey, string> = Object.fromEntries(
  LINHAS.map((l) => [l.key, l.label])
) as Record<StatKey, string>;

const AMIZADE_MAX = 255;

/**
 * O que o save sabe de um pokémon do time e a carta não mostra: natureza,
 * IVs, EVs, golpes e amizade.
 *
 * É um `<details>` fechado por padrão. A carta continua sendo o rosto do time,
 * e a ficha é para quem quer abrir.
 */
const TeamMemberSheet = ({ membro, pokemon }: Props) => {
  const natureza = natureOf(membro.nature);
  const habilidade = pokemon ? abilityForGen3Slot(pokemon, membro.abilitySlot) : undefined;
  const totalEvs = LINHAS.reduce((s, l) => s + membro.evs[l.key], 0);

  return (
    <details className="team-sheet">
      <summary>Ficha</summary>

      <dl className="team-sheet-fatos">
        {natureza && (
          <>
            <dt>Natureza</dt>
            <dd>
              {natureza.name}
              {natureza.up && natureza.down ? (
                <span className="team-sheet-efeito">
                  {" "}
                  +{ROTULO[natureza.up]} −{ROTULO[natureza.down]}
                </span>
              ) : (
                <span className="team-sheet-efeito"> neutra</span>
              )}
            </dd>
          </>
        )}
        {habilidade && (
          <>
            <dt>Habilidade</dt>
            <dd>{prettyMoveName(habilidade)}</dd>
          </>
        )}
        <dt>Amizade</dt>
        <dd>
          {membro.friendship}
          <span className="team-sheet-efeito"> de {AMIZADE_MAX}</span>
        </dd>
        {membro.shiny && (
          <>
            <dt>Cor</dt>
            <dd>Shiny ✨</dd>
          </>
        )}
      </dl>

      <table className="team-sheet-status">
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Valor</th>
            <th scope="col">IV</th>
            <th scope="col">EV</th>
          </tr>
        </thead>
        <tbody>
          {LINHAS.map(({ key, label }) => {
            const sobe = natureza?.up === key;
            const desce = natureza?.down === key;
            return (
              <tr key={key}>
                <th scope="row">
                  {label}
                  {sobe && <span className="team-sheet-sobe" aria-label="natureza sobe"> ▲</span>}
                  {desce && <span className="team-sheet-desce" aria-label="natureza desce"> ▼</span>}
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
              EVs somados
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
                <span>{slug ? prettyMoveName(slug) : `Golpe #${m.id}`}</span>
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
