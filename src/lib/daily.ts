/**
 * O pokémon do dia: o mesmo para todo mundo no mesmo dia, sem servidor.
 *
 * Em vez de sortear (e arriscar repetir dois dias seguidos), percorre as 1025
 * espécies numa permutação: `(dia × 389 + 25) mod 1025`. 389 é primo e não
 * divide 1025 (= 5² × 41), então a sequência visita todas antes de voltar à
 * primeira — são quase três anos sem repetir.
 */

/** Espécies da dex nacional até Paldea. */
export const TOTAL_SPECIES = 1025;
const PASSO = 389;
const DESLOCAMENTO = 25;

/**
 * Dias desde 1970-01-01 no calendário **local**. Usa Date.UTC com a data local
 * para não depender do fuso nem do horário de verão.
 */
export function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function dailyPokemonId(date: Date = new Date()): number {
  return ((dayNumber(date) * PASSO + DESLOCAMENTO) % TOTAL_SPECIES) + 1;
}
