/**
 * A busca da paleta (Ctrl+K): uma lista de destinos de todos os cantos do
 * site, e um ranking simples e previsível sobre ela. Pura, sem React.
 */

export type CommandKind = "page" | "pokemon" | "ability" | "region" | "lore";

export interface CommandItem {
  kind: CommandKind;
  label: string;
  to: string;
  /** Outros termos que também acham o item (sinônimos, nome original). */
  keywords: string[];
  /** Texto miúdo ao lado do rótulo. */
  hint?: string;
  /** Id da dex, para mostrar o sprite. */
  spriteId?: number;
}

/** Minúsculas, sem acento, hífen e pontuação viram espaço. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-_.,:;'’/()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Quanto melhor o encaixe, menor o número; -1 não acha.
 *
 * 0 exato · 1 palavras inteiras ("magma" em "Team Magma") · 2 começa com
 * ("magma" em "Magmar") · 3 alguma palavra começa com · 4 contém. Palavra
 * inteira ganha de prefixo: quem digita "magma" quer a equipe, não o Magmar.
 */
function encaixe(alvo: string, q: string): number {
  if (alvo === q) return 0;
  if (` ${alvo} `.includes(` ${q} `)) return 1;
  if (alvo.startsWith(q)) return 2;
  if (` ${alvo}`.includes(` ${q}`)) return 3;
  if (alvo.includes(q)) return 4;
  return -1;
}

const PRIORIDADE: Record<CommandKind, number> = {
  page: 0,
  region: 1,
  pokemon: 2,
  ability: 3,
  lore: 4,
};

export function searchCommands(
  query: string,
  items: CommandItem[],
  { perKind = 6, total = 24 }: { perKind?: number; total?: number } = {}
): CommandItem[] {
  const q = normalize(query);
  if (!q) return [];

  const achados: { item: CommandItem; nota: number }[] = [];
  for (const item of items) {
    let melhor = -1;
    for (const termo of [item.label, ...item.keywords]) {
      const e = encaixe(normalize(termo), q);
      if (e >= 0 && (melhor < 0 || e < melhor)) melhor = e;
    }
    if (melhor >= 0) achados.push({ item, nota: melhor });
  }

  achados.sort(
    (a, b) =>
      a.nota - b.nota ||
      PRIORIDADE[a.item.kind] - PRIORIDADE[b.item.kind] ||
      a.item.label.length - b.item.label.length ||
      a.item.label.localeCompare(b.item.label)
  );

  const porTipo = new Map<CommandKind, number>();
  const out: CommandItem[] = [];
  for (const { item } of achados) {
    const n = porTipo.get(item.kind) ?? 0;
    if (n >= perKind) continue;
    porTipo.set(item.kind, n + 1);
    out.push(item);
    if (out.length >= total) break;
  }
  return out;
}
