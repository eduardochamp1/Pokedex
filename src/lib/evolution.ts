import type { EvolutionDetail } from "../types/pokemon";

/** "fire-stone" -> "Fire Stone" */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TIME_PT: Record<string, string> = {
  day: "de dia",
  night: "de noite",
};

/**
 * Traduz o evolution_details da API numa frase curta em PT-BR.
 *
 * A API expoe ~20 campos de condicao e quase todos vem null. Montamos so o
 * que esta preenchido e devolvemos string vazia quando nada e legivel — a UI
 * decide se esconde a legenda. Nunca inventar texto.
 */
export function evolutionConditionText(
  detail: EvolutionDetail | undefined
): string {
  if (!detail) return "";

  const trigger = detail.trigger?.name ?? "";
  const partes: string[] = [];

  if (trigger === "use-item" && detail.item) {
    partes.push(humanize(detail.item.name));
  } else if (trigger === "trade") {
    partes.push(
      detail.held_item
        ? `troca segurando ${humanize(detail.held_item.name)}`
        : "troca"
    );
  } else {
    if (detail.min_level !== null) partes.push(`nível ${detail.min_level}`);
    if (detail.min_happiness !== null) partes.push(`amizade ${detail.min_happiness}`);
    if (detail.min_affection !== null) partes.push(`afeto ${detail.min_affection}`);
    if (detail.min_beauty !== null) partes.push(`beleza ${detail.min_beauty}`);
    if (detail.held_item) partes.push(`segurando ${humanize(detail.held_item.name)}`);
    if (detail.location) partes.push(`em ${humanize(detail.location.name)}`);
    if (detail.needs_overworld_rain) partes.push("na chuva");
    if (detail.turn_upside_down) partes.push("de cabeça para baixo");
    if (detail.gender === 1) partes.push("fêmea");
    if (detail.gender === 2) partes.push("macho");
  }

  // known_move e hora do dia valem para qualquer gatilho.
  if (detail.known_move) {
    const texto = `sabendo ${humanize(detail.known_move.name)}`;
    if (partes.length > 0) return `${partes.join(", ")} ${texto}`;
    partes.push(texto);
  }
  if (detail.time_of_day && TIME_PT[detail.time_of_day]) {
    partes.push(TIME_PT[detail.time_of_day]);
  }

  return partes.join(", ");
}
