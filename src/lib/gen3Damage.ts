/**
 * Dano como a 3ª geração calcula, seguindo a decompilação (pokeemerald:
 * `CalculateBaseDamage`, depois `Cmd_damagecalc`, `Cmd_typecalc` e
 * `ApplyRandomDmgMultiplier`, nessa ordem). Tudo em inteiros, arredondando
 * para baixo a cada passo, como o jogo.
 *
 * O que ficou de fora: estágios de status, telas (Reflect/Light Screen),
 * batalha dupla, itens e a maioria das habilidades. Das habilidades, entram as
 * que mudam a conta sem depender do estado da batalha: Huge Power, Pure Power,
 * Thick Fat e Levitate.
 */
import { attackMultiplier, type TypeName } from "../data/typeMatchups";
import { VERSION_GROUPS } from "../data/versionGroups";

/** Em Gen 3 físico ou especial é do tipo do golpe, não do golpe. */
const FISICOS = new Set<TypeName>([
  "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel",
]);

export function isPhysicalGen3(type: TypeName): boolean {
  return FISICOS.has(type);
}

/**
 * A tabela de hoje, com o que era diferente até a Gen 5: Aço resistia a
 * Fantasma e Sombrio. Fada não existia — os pokémon de Gen 3 que viraram Fada
 * voltam ao tipo antigo em `gen3PokemonTypes`.
 */
export function gen3TypeMultiplier(moveType: TypeName, defenderTypes: TypeName[]): number {
  return defenderTypes.reduce((m, def) => m * umTipo(moveType, def), 1);
}

function umTipo(moveType: TypeName, def: TypeName): number {
  if (def === "steel" && (moveType === "ghost" || moveType === "dark")) return 0.5;
  return attackMultiplier(moveType, [def]);
}

export type Weather = "none" | "rain" | "sun";

export interface DamageInput {
  level: number;
  /** Ataque ou Ataque Especial, conforme o tipo do golpe. */
  attack: number;
  /** Defesa ou Defesa Especial, conforme o tipo do golpe. */
  defense: number;
  power: number;
  moveType: TypeName;
  attackerTypes: TypeName[];
  defenderTypes: TypeName[];
  crit?: boolean;
  burned?: boolean;
  weather?: Weather;
  /** Slug da PokéAPI ("huge-power"). */
  attackerAbility?: string;
  defenderAbility?: string;
}

export interface DamageResult {
  /** As 16 rolagens, de 85% a 100%. */
  rolls: number[];
  min: number;
  max: number;
  effectiveness: number;
}

export function calcGen3Damage(i: DamageInput): DamageResult {
  const fisico = isPhysicalGen3(i.moveType);
  let atk = i.attack;
  if (fisico && (i.attackerAbility === "huge-power" || i.attackerAbility === "pure-power")) atk *= 2;
  if (i.defenderAbility === "thick-fat" && (i.moveType === "fire" || i.moveType === "ice")) atk = Math.floor(atk / 2);

  let dano = Math.floor(Math.floor((atk * i.power * Math.floor((2 * i.level) / 5 + 2)) / i.defense) / 50);
  if (fisico) {
    if (i.burned) dano = Math.floor(dano / 2);
    if (dano === 0) dano = 1;
  } else if (i.weather === "rain") {
    if (i.moveType === "water") dano = Math.floor((dano * 15) / 10);
    if (i.moveType === "fire") dano = Math.floor(dano / 2);
  } else if (i.weather === "sun") {
    if (i.moveType === "fire") dano = Math.floor((dano * 15) / 10);
    if (i.moveType === "water") dano = Math.floor(dano / 2);
  }
  dano += 2;

  if (i.crit) dano *= 2;
  if (i.attackerTypes.includes(i.moveType)) dano = Math.floor((dano * 15) / 10);

  let efetividade = 1;
  if (i.moveType === "ground" && i.defenderAbility === "levitate") efetividade = 0;
  for (const def of i.defenderTypes) {
    const m = umTipo(i.moveType, def);
    efetividade *= m;
    dano = Math.floor((dano * m * 10) / 10);
    // ModulateDmgByType: resistido até zerar ainda tira 1; só imunidade zera.
    if (dano === 0 && m !== 0) dano = 1;
  }
  if (efetividade === 0) return { rolls: Array(16).fill(0), min: 0, max: 0, effectiveness: 0 };

  const rolls: number[] = [];
  for (let pct = 85; pct <= 100; pct++) {
    const r = Math.floor((dano * pct) / 100);
    rolls.push(dano === 0 ? 0 : Math.max(1, r));
  }
  return { rolls, min: rolls[0], max: rolls[15], effectiveness: efetividade };
}

/** Quantos golpes para derrubar `hp`. `null` quando o golpe não causa dano. */
export function hitsToKo(r: { min: number; max: number }, hp: number): { hits: number; guaranteed: boolean } | null {
  if (r.max <= 0) return null;
  const peloMax = Math.ceil(hp / r.max);
  const peloMin = r.min > 0 ? Math.ceil(hp / r.min) : Infinity;
  return { hits: peloMax, guaranteed: peloMin === peloMax };
}

// ---------------------------------------------------------------------------
// Dados "da época": a PokéAPI dá os valores de hoje e o histórico de mudanças.

const DA_GEN_3_OU_ANTES = new Set([
  "red-green-japan", "blue-japan", "red-blue", "yellow", "gold-silver", "crystal",
  "ruby-sapphire", "emerald", "firered-leafgreen", "colosseum", "xd",
]);
const ORDEM_DOS_GRUPOS = new Map(VERSION_GROUPS.map((g, i) => [g.id, i]));

interface MoveLike {
  power: number | null;
  type: { name: string };
  past_values?: { power: number | null; type: { name: string } | null; version_group: { name: string } }[];
}

/**
 * Poder e tipo do golpe em Gen 3. Cada entrada de `past_values` diz o valor
 * que valia **antes** daquele grupo de versões; para Gen 3 vale a mudança mais
 * antiga que veio depois dela, campo por campo.
 */
export function gen3MoveData(move: MoveLike): { power: number | null; type: TypeName } {
  const depois = (move.past_values ?? [])
    .filter((v) => !DA_GEN_3_OU_ANTES.has(v.version_group.name))
    .sort(
      (a, b) =>
        (ORDEM_DOS_GRUPOS.get(a.version_group.name) ?? Infinity) -
        (ORDEM_DOS_GRUPOS.get(b.version_group.name) ?? Infinity)
    );
  const power = depois.find((v) => v.power !== null)?.power ?? move.power;
  const type = depois.find((v) => v.type !== null)?.type?.name ?? move.type.name;
  return { power, type: type as TypeName };
}

interface PokemonLike {
  types: { slot: number; type: { name: string } }[];
  past_types?: { generation: { name: string }; types: { slot: number; type: { name: string } }[] }[];
}

const ROMANOS: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };
const geracao = (nome: string) => ROMANOS[nome.replace("generation-", "")] ?? 0;

/**
 * Os tipos em Gen 3. `past_types` diz os tipos **até** aquela geração
 * inclusive; vale a entrada da menor geração que seja 3 ou mais.
 */
export function gen3PokemonTypes(p: PokemonLike): TypeName[] {
  const antigo = (p.past_types ?? [])
    .filter((pt) => geracao(pt.generation.name) >= 3)
    .sort((a, b) => geracao(a.generation.name) - geracao(b.generation.name))[0];
  const tipos = antigo ? antigo.types : p.types;
  return [...tipos].sort((a, b) => a.slot - b.slot).map((t) => t.type.name as TypeName);
}
