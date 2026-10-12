/**
 * Quem vem antes e depois na lista da Pokédex.
 *
 * É o que as setas ↑/↓ (teclado e D-pad) usam. Sem seleção — ou com a seleção
 * fora da página atual da lista — a seta entra pela ponta: ↓ no primeiro, ↑ no
 * último. Nas pontas não dá a volta: `undefined` deixa a página decidir se
 * troca de página.
 */
export function neighbor(
  names: readonly string[],
  current: string | undefined,
  step: 1 | -1
): string | undefined {
  if (names.length === 0) return undefined;
  const i = current ? names.indexOf(current.toLowerCase()) : -1;
  if (i === -1) return step === 1 ? names[0] : names[names.length - 1];
  return names[i + step];
}

export interface FarStep {
  /** O que vai na URL: o nome, ou o número quando só ele é conhecido. */
  target: string;
  /** A página da lista (base 0) em que o alvo aparece. */
  page: number;
}

/**
 * O vizinho quando a seleção está fora da página visível da lista — quem
 * chega por link direto em `/pokemon/eevee` com a lista ainda na página 1.
 * Em vez de entrar pela ponta da página errada, anda a partir de onde a
 * seleção realmente está e leva a lista junto.
 *
 * `order` é a lista inteira quando há busca ou filtro; sem eles a lista segue
 * o número da Pokédex, e basta o `id`. Devolve `undefined` quando a seleção
 * não pertence à lista (uma forma alternativa, um pokémon fora do filtro) ou
 * quando não há vizinho naquela direção.
 */
export function farStep(
  opts: { order: readonly string[] | null; current: string | undefined; id: number | undefined; total: number },
  step: 1 | -1,
  pageSize: number
): FarStep | undefined {
  const { order, current, id, total } = opts;
  if (order) {
    const i = current ? order.indexOf(current.toLowerCase()) : -1;
    const alvo = i === -1 ? undefined : order[i + step];
    return alvo ? { target: alvo, page: Math.floor((i + step) / pageSize) } : undefined;
  }
  if (!id || id > total) return undefined;
  const alvo = id + step;
  if (alvo < 1 || alvo > total) return undefined;
  return { target: String(alvo), page: Math.floor((alvo - 1) / pageSize) };
}
