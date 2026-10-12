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
