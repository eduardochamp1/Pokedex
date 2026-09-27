/**
 * Golpes: de `pokemon.moves` cru para algo exibivel.
 *
 * A API entrega uma lista plana onde cada golpe repete uma entrada por jogo em
 * que e aprendido — o Pikachu vem com 109 golpes e centenas de entradas. Quem
 * consulta quer os golpes de UM jogo, agrupados por como se aprende. Tudo aqui
 * e puro: sem React e sem fetch.
 */
import { versionGroupOrder } from "../data/versionGroups";
import type { PokemonMove } from "../types/pokemon";

/** Os quatro metodos que importam; o resto (formas, eventos) vira "outro". */
export type LearnMethod = "level-up" | "machine" | "egg" | "tutor" | "other";

export const LEARN_METHODS: { id: LearnMethod; label: string; labelEn: string }[] = [
  { id: "level-up", label: "Por nível", labelEn: "Level up" },
  { id: "machine", label: "MT/MO", labelEn: "TM/HM" },
  { id: "egg", label: "Ovo", labelEn: "Egg" },
  { id: "tutor", label: "Tutor", labelEn: "Tutor" },
  { id: "other", label: "Outros", labelEn: "Other" },
];

export interface LearnedMove {
  /** Slug da API ("thunder-shock"). */
  name: string;
  method: LearnMethod;
  /** Nivel de aprendizado; 0 quando o metodo nao e por nivel. */
  level: number;
}

function toMethod(raw: string): LearnMethod {
  switch (raw) {
    case "level-up":
    case "machine":
    case "egg":
    case "tutor":
      return raw;
    default:
      return "other";
  }
}

/**
 * Jogos em que este pokemon aprende alguma coisa, do mais recente para o mais
 * antigo. Um jogo que nao esta na lista curada vai para o fim, em vez de
 * sumir.
 */
export function availableVersionGroups(moves: PokemonMove[]): string[] {
  const seen = new Set<string>();
  for (const entry of moves) {
    for (const detail of entry.version_group_details) {
      seen.add(detail.version_group.name);
    }
  }
  return [...seen].sort((a, b) => versionGroupOrder(b) - versionGroupOrder(a));
}

/**
 * Qual jogo mostrar sem ninguem escolher.
 *
 * "O mais recente" parece a resposta obvia e nao e: grupos novos como
 * `champions` so tem o metodo `train` — no Pikachu sao 60 golpes que caem
 * todos em "Outros", sem nivel nem MT, e a tela abre inutil. O que serve e o
 * jogo mais recente que ENSINA POR NIVEL, que e a lista de linha principal.
 * Sem nenhum assim, cai para o mais recente que houver.
 */
export function preferredVersionGroup(
  moves: PokemonMove[]
): string | undefined {
  const groups = availableVersionGroups(moves);
  const mainline = groups.find((vg) =>
    moves.some((entry) =>
      entry.version_group_details.some(
        (d) =>
          d.version_group.name === vg &&
          d.move_learn_method.name === "level-up"
      )
    )
  );
  return mainline ?? groups[0];
}

/**
 * Golpes de um jogo.
 *
 * Um mesmo golpe pode aparecer duas vezes no mesmo jogo por metodos diferentes
 * (aprender por nivel E por MT, por exemplo) — as duas entradas valem, porque a
 * pergunta "como consigo esse golpe" tem duas respostas. Repeticao do MESMO par
 * golpe+metodo e que e descartada.
 */
export function movesForVersionGroup(
  moves: PokemonMove[],
  versionGroup: string
): LearnedMove[] {
  const out = new Map<string, LearnedMove>();
  for (const entry of moves) {
    for (const detail of entry.version_group_details) {
      if (detail.version_group.name !== versionGroup) continue;
      const method = toMethod(detail.move_learn_method.name);
      const key = `${entry.move.name}|${method}`;
      const existing = out.get(key);
      const level = detail.level_learned_at ?? 0;
      // Mesmo par repetido: fica o menor nivel, que e quando de fato se aprende.
      if (!existing || (level > 0 && level < existing.level)) {
        out.set(key, { name: entry.move.name, method, level });
      }
    }
  }
  return [...out.values()];
}

/**
 * Ordena para leitura: por nivel os que tem nivel, alfabetico o resto.
 *
 * Quem olha a lista de nivel esta perguntando "o que vem depois"; quem olha
 * MT/ovo/tutor esta procurando um nome.
 */
export function sortMoves(moves: LearnedMove[]): LearnedMove[] {
  return [...moves].sort((a, b) => {
    if (a.level !== b.level && a.level > 0 && b.level > 0) return a.level - b.level;
    if (a.level > 0 !== b.level > 0) return a.level > 0 ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Separa por metodo, ja ordenado, mantendo a ordem de LEARN_METHODS. */
export function groupByMethod(
  moves: LearnedMove[]
): { method: LearnMethod; label: string; labelEn: string; moves: LearnedMove[] }[] {
  return LEARN_METHODS.map(({ id, label, labelEn }) => ({
    method: id,
    label,
    labelEn,
    moves: sortMoves(moves.filter((m) => m.method === id)),
  })).filter((group) => group.moves.length > 0);
}

/** "thunder-shock" -> "Thunder Shock". Sem request nenhum. */
export function prettyMoveName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
