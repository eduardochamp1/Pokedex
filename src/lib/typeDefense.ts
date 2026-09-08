import { POKEMON_TYPES } from "../hooks/usePokemon";
import { attackMultiplier, type TypeName } from "../data/typeMatchups";

export interface DefenseGroup {
  multiplier: number;
  types: TypeName[];
}

/**
 * Perfil defensivo de um pokemon: quanto cada tipo atacante causa contra a
 * combinacao dele.
 *
 * Reaproveita a matriz canonica de src/data/typeMatchups.ts, que ate agora era
 * usada so no Comparar. Nao faz request nenhum.
 *
 * O grupo de 1x fica de fora de proposito: neutro nao e informacao util numa
 * ficha, e ocuparia metade do painel.
 */
export function defenseProfile(defenderTypes: string[]): DefenseGroup[] {
  if (defenderTypes.length === 0) return [];
  const defenders = defenderTypes as TypeName[];

  const byMultiplier = new Map<number, TypeName[]>();
  for (const attacker of POKEMON_TYPES) {
    const m = attackMultiplier(attacker, defenders);
    if (m === 1) continue;
    const list = byMultiplier.get(m) ?? [];
    list.push(attacker);
    byMultiplier.set(m, list);
  }

  return [...byMultiplier.entries()]
    .map(([multiplier, types]) => ({ multiplier, types }))
    .sort((a, b) => b.multiplier - a.multiplier);
}

/** Rotulo curto do multiplicador, para badge. */
export function multiplierLabel(m: number): string {
  if (m === 0) return "imune";
  if (m === 0.25) return "¼×";
  if (m === 0.5) return "½×";
  return `${m}×`;
}
