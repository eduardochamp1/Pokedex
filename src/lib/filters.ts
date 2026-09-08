/**
 * Logica pura de indice, busca e interseccao de filtros.
 * Sem React e sem fetch — testavel isoladamente.
 */

/** Extrai o id numerico de uma URL da PokeAPI ("/pokemon/25/" -> 25). */
export function extractIdFromUrl(url: string): number | undefined {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : undefined;
}

/** Monta o mapa nome -> id a partir de qualquer lista de recursos da PokeAPI. */
export function buildNameIndex(
  results: { name: string; url: string }[]
): Map<string, number> {
  const index = new Map<string, number>();
  for (const r of results) {
    const id = extractIdFromUrl(r.url);
    if (id !== undefined) index.set(r.name, id);
  }
  return index;
}

/**
 * Interseccao de N listas de nomes, preservando a ordem da primeira lista.
 * Listas vazias participam da interseccao (resultado vazio) — quem nao quer
 * participar nao deve ser passado.
 */
export function intersectNames(sources: string[][]): string[] {
  if (sources.length === 0) return [];
  const [first, ...rest] = sources;
  if (rest.length === 0) return [...new Set(first)];
  const sets = rest.map((s) => new Set(s));
  return [...new Set(first)].filter((name) => sets.every((s) => s.has(name)));
}

/** Ordena nomes pelo id da Pokedex; desconhecidos vao para o fim, por nome. */
export function sortNamesById(
  names: string[],
  index: Map<string, number>
): string[] {
  return [...names].sort((a, b) => {
    const ia = index.get(a);
    const ib = index.get(b);
    if (ia === undefined && ib === undefined) return a.localeCompare(b);
    if (ia === undefined) return 1;
    if (ib === undefined) return -1;
    return ia - ib;
  });
}

/**
 * Busca parcial sobre o indice. Relevancia: match exato, depois prefixo,
 * depois substring — cada grupo ordenado por id. Aceita tambem busca por id
 * exato ("25" -> pikachu).
 */
export function searchNames(
  query: string,
  index: Map<string, number>,
  limit = 60
): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  if (/^\d+$/.test(q)) {
    const wanted = Number(q);
    const hit = [...index.entries()].find(([, id]) => id === wanted);
    return hit ? [hit[0]] : [];
  }

  const exact: string[] = [];
  const prefix: string[] = [];
  const substring: string[] = [];
  for (const name of index.keys()) {
    if (name === q) exact.push(name);
    else if (name.startsWith(q)) prefix.push(name);
    else if (name.includes(q)) substring.push(name);
  }
  return [
    ...sortNamesById(exact, index),
    ...sortNamesById(prefix, index),
    ...sortNamesById(substring, index),
  ].slice(0, limit);
}

/** Fatia uma selecao de nomes na pagina pedida. */
export function pageOf<T>(items: T[], page: number, perPage: number): T[] {
  const start = page * perPage;
  return items.slice(start, start + perPage);
}

/** Total de paginas para uma selecao (minimo 1, para nao renderizar "1 de 0"). */
export function totalPagesOf(count: number, perPage: number): number {
  return Math.max(1, Math.ceil(count / perPage));
}
