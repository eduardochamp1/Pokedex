/**
 * O cartão de treinador como imagem PNG, para baixar ou compartilhar.
 *
 * `cardContent` decide o que vai escrito (puro, testado); `drawTrainerCard`
 * só desenha no canvas. Os sprites são os locais (`pixelSpriteUrl`), da mesma
 * origem — sprite de outra origem "sujaria" o canvas e o `toBlob` falharia.
 */
import type { TrainerEntry } from "./trainerLog";
import { formatMoney, formatPlayTime, formatTrainerId } from "./trainerText";
import { gameLabel } from "./gen3Game";
import { TOTAL_DA_DEX_GEN3 } from "./playerDex";
import type { Lang } from "../i18n/lang";

export interface CardContent {
  title: string;
  subtitle: string;
  facts: [string, string][];
  /** `null` quando o jogo não registra insígnias. */
  badges: boolean[] | null;
  team: { national: number; label: string; level: number }[];
}

export function cardContent(e: TrainerEntry, lang: Lang): CardContent {
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);
  const tr = e.trainer;
  const segundos = tr.playTime.hours * 3600 + tr.playTime.minutes * 60 + tr.playTime.seconds;
  const facts: [string, string][] = [[t("Tempo", "Time"), formatPlayTime(segundos)]];
  if (tr.money !== null) facts.push([t("Dinheiro", "Money"), formatMoney(tr.money, lang)]);
  facts.push(["Pokédex", `${e.owned.length} / ${TOTAL_DA_DEX_GEN3}`]);
  if (tr.badges) facts.push([t("Insígnias", "Badges"), `${tr.badges.filter(Boolean).length} / 8`]);
  return {
    title: `${e.playerName} ${tr.gender === "female" ? "♀" : "♂"}`,
    subtitle: `${gameLabel(e.game ?? "emerald")} · ID ${formatTrainerId(tr.trainerId)}`,
    facts,
    badges: tr.badges,
    team: e.party.map((m) => ({ national: m.national, label: m.nickname, level: m.level })),
  };
}

export function cardFileName(e: TrainerEntry): string {
  const nome = e.playerName.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "treinador";
  return `treinador-${nome}-${formatTrainerId(e.trainer.trainerId)}.png`;
}

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 420;

export interface CardTheme {
  paper: string;
  ink: string;
  accent: string;
  font: string;
}

/** Desenha o cartão. `sprites` na ordem do time; os que não carregaram ficam de fora. */
export function drawTrainerCard(
  ctx: CanvasRenderingContext2D,
  c: CardContent,
  sprites: (HTMLImageElement | null)[],
  theme: CardTheme,
  lang: Lang
): void {
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;
  // Secundário é a própria tinta do papel, mais clara: contraste em qualquer tema.
  const tinta = (alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = theme.ink;
  };
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  tinta(0.8);
  ctx.font = `700 14px ${theme.font}`;
  ctx.fillText(lang === "en" ? "TRAINER CARD" : "CARTÃO DE TREINADOR", 32, 42);

  tinta(1);
  ctx.font = `700 40px ${theme.font}`;
  ctx.fillText(c.title, 32, 92);
  tinta(0.65);
  ctx.font = `400 18px ${theme.font}`;
  ctx.fillText(c.subtitle, 32, 122);
  ctx.globalAlpha = 1;

  // Fatos em duas colunas.
  c.facts.forEach(([k, v], i) => {
    const x = 32 + (i % 2) * 260;
    const y = 170 + Math.floor(i / 2) * 58;
    tinta(0.65);
    ctx.font = `700 12px ${theme.font}`;
    ctx.fillText(k.toUpperCase(), x, y);
    tinta(1);
    ctx.font = `700 26px ${theme.font}`;
    ctx.fillText(v, x, y + 28);
  });

  // Insígnias: oito losangos, cheios os ganhos.
  if (c.badges) {
    c.badges.forEach((tem, i) => {
      const cx = 560 + (i % 4) * 52;
      const cy = 170 + Math.floor(i / 4) * 52;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 16, cy);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx - 16, cy);
      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = tem ? theme.accent : theme.ink;
      ctx.globalAlpha = tem ? 1 : 0.35;
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (tem) {
        ctx.fillStyle = theme.accent;
        ctx.fill();
      }
    });
  }

  // O time, com sprite em pixel nítido.
  ctx.imageSmoothingEnabled = false;
  c.team.forEach((m, i) => {
    const x = 32 + i * 124;
    const img = sprites[i];
    // O sprite tem 96×96 com margem transparente: 112 px deixa o bicho legível.
    if (img) ctx.drawImage(img, x + 2, 262, 112, 112);
    tinta(1);
    ctx.font = `700 13px ${theme.font}`;
    ctx.fillText(m.label, x + 4, 386, 116);
    tinta(0.65);
    ctx.font = `400 12px ${theme.font}`;
    ctx.fillText(`${lang === "en" ? "lv" : "nv"} ${m.level}`, x + 4, 402);
    ctx.globalAlpha = 1;
  });
}
