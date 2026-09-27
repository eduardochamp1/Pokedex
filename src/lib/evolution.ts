import type { EvolutionDetail } from "../types/pokemon";
import { getLang, type Lang } from "../i18n/lang";
import { tType } from "../data/i18n";

/** "fire-stone" -> "Fire Stone" */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TIME: Record<string, [string, string]> = {
  day: ["de dia", "during the day"],
  night: ["de noite", "at night"],
};

/**
 * Traduz o evolution_details da API numa frase curta, em PT-BR ou em inglês.
 *
 * A API expoe ~20 campos de condicao e quase todos vem null. Montamos so o
 * que esta preenchido e devolvemos string vazia quando nada e legivel — a UI
 * decide se esconde a legenda. Nunca inventar texto.
 */
export function evolutionConditionText(
  detail: EvolutionDetail | undefined,
  lang: Lang = getLang()
): string {
  if (!detail) return "";
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);

  const trigger = detail.trigger?.name ?? "";
  const partes: string[] = [];

  if (trigger === "use-item" && detail.item) {
    partes.push(humanize(detail.item.name));
  } else if (trigger === "trade") {
    partes.push(
      detail.held_item
        ? t(`troca segurando ${humanize(detail.held_item.name)}`, `trade holding ${humanize(detail.held_item.name)}`)
        : detail.trade_species
          ? t(`troca por ${humanize(detail.trade_species.name)}`, `trade for ${humanize(detail.trade_species.name)}`)
          : t("troca", "trade")
    );
  } else {
    if (detail.min_level !== null) partes.push(t(`nível ${detail.min_level}`, `level ${detail.min_level}`));
    if (detail.min_happiness !== null) partes.push(t(`amizade ${detail.min_happiness}`, `friendship ${detail.min_happiness}`));
    if (detail.min_affection !== null) partes.push(t(`afeto ${detail.min_affection}`, `affection ${detail.min_affection}`));
    if (detail.min_beauty !== null) partes.push(t(`beleza ${detail.min_beauty}`, `beauty ${detail.min_beauty}`));
    if (detail.held_item) partes.push(t(`segurando ${humanize(detail.held_item.name)}`, `holding ${humanize(detail.held_item.name)}`));
    if (detail.location) partes.push(t(`em ${humanize(detail.location.name)}`, `at ${humanize(detail.location.name)}`));
    if (detail.needs_overworld_rain) partes.push(t("na chuva", "in the rain"));
    if (detail.turn_upside_down) partes.push(t("de cabeça para baixo", "upside down"));
    if (detail.gender === 1) partes.push(t("fêmea", "female"));
    if (detail.gender === 2) partes.push(t("macho", "male"));
  }

  // known_move e hora do dia valem para qualquer gatilho.
  const tipoDoGolpe = detail.known_move_type?.name;
  if (detail.known_move || tipoDoGolpe) {
    const texto = detail.known_move
      ? t(`sabendo ${humanize(detail.known_move.name)}`, `knowing ${humanize(detail.known_move.name)}`)
      : t(`sabendo um golpe do tipo ${tType(tipoDoGolpe, lang)}`, `knowing a ${tType(tipoDoGolpe, lang)}-type move`);
    if (partes.length > 0) return `${partes.join(", ")} ${texto}`;
    partes.push(texto);
  }
  const hora = detail.time_of_day ? TIME[detail.time_of_day] : undefined;
  if (hora) partes.push(t(...hora));

  return partes.join(", ");
}
