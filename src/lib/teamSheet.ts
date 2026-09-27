/**
 * O que a ficha de um pokémon do save precisa tirar da resposta da PokéAPI.
 *
 * Sem request extra: habilidades, `past_abilities` e a lista de golpes já vêm
 * no `/pokemon/{id}` que a carta do time buscou.
 */
import type { PastAbilities, PokemonAbility, PokemonMove } from "../types/pokemon";
import { extractIdFromUrl } from "./filters";

const ROMANOS: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9,
};

function numeroDaGeracao(name: string): number | undefined {
  return ROMANOS[name.replace("generation-", "")];
}

/**
 * As habilidades comuns da espécie **como eram em Gen 3**, na ordem do slot.
 *
 * A PokéAPI dá as de hoje, e algumas mudaram — o Gengar tinha Levitate até a
 * Gen VI. `past_abilities` diz como os slots eram *antes* de cada geração; a
 * que vale para a Gen III é a entrada de menor geração depois dela. Oculta fica
 * de fora sempre: ela só existe a partir da Gen V.
 */
export function gen3Abilities(p: {
  abilities: PokemonAbility[];
  past_abilities?: PastAbilities[];
}): string[] {
  const porSlot = new Map<number, string | null>();
  for (const a of p.abilities) if (!a.is_hidden) porSlot.set(a.slot, a.ability.name);

  const depoisDaIII = (p.past_abilities ?? [])
    .map((e) => ({ e, g: numeroDaGeracao(e.generation.name) }))
    .filter((x): x is { e: PastAbilities; g: number } => x.g !== undefined && x.g > 3)
    .sort((a, b) => a.g - b.g)[0];
  for (const a of depoisDaIII?.e.abilities ?? []) {
    if (a.is_hidden) continue;
    porSlot.set(a.slot, a.ability?.name ?? null);
  }

  return [...porSlot.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, name]) => (name ? [name] : []));
}

/** O bit do save escolhe entre as duas; espécie de uma só ignora o bit. */
export function abilityForGen3Slot(
  p: { abilities: PokemonAbility[]; past_abilities?: PastAbilities[] },
  slot: 0 | 1
): string | undefined {
  const lista = gen3Abilities(p);
  return lista[slot] ?? lista[0];
}

/**
 * O número de golpe do save é o mesmo da PokéAPI (1–354 em Gen 3). O nome sai
 * da lista de golpes da espécie; golpe que ela não lista fica `undefined`.
 */
export function moveSlugById(moves: PokemonMove[], id: number): string | undefined {
  return moves.find((m) => extractIdFromUrl(m.move.url) === id)?.move.name;
}
