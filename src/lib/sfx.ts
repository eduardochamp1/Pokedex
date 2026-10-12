/**
 * Os bipes do aparelho: sons curtos, sintetizados na hora com a Web Audio
 * API, para cada transição — trocar de aba, andar na lista, abrir uma ficha,
 * voltar. Não há arquivo de áudio.
 *
 * Seguem o mesmo botão ♪ da trilha ambiente: mudo é mudo para tudo.
 */
import { readMusic } from "./ambientMusic";

export type Sfx = "mover" | "aba" | "abrir" | "voltar";

/** Cada som: notas (Hz) tocadas em sequência, e quanto dura cada uma (s). */
export const SONS: Record<Sfx, { notas: number[]; passo: number }> = {
  // Um toque seco: o cursor andou.
  mover: { notas: [1175], passo: 0.045 },
  // Dois toques subindo: outra aba do aparelho.
  aba: { notas: [784, 1175], passo: 0.06 },
  // Três subindo: a ficha abriu.
  abrir: { notas: [659, 880, 1319], passo: 0.055 },
  // Dois descendo: voltou.
  voltar: { notas: [880, 587], passo: 0.06 },
};

/** Mais alto que a trilha, mas ainda discreto. */
const VOLUME = 0.07;
/** Dois sons do mesmo gesto (a seta e a ficha que ela abre) viram um só. */
const INTERVALO_MIN = 0.09;

let ctx: AudioContext | null = null;
let ultimo = -1;

export function playSfx(som: Sfx): void {
  if (!readMusic()) return;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx ??= new Ctor();
  // Antes do primeiro gesto o navegador mantém o contexto suspenso: sem som.
  if (ctx.state === "suspended") void ctx.resume();
  const agora = ctx.currentTime;
  if (agora - ultimo < INTERVALO_MIN) return;
  ultimo = agora;

  const { notas, passo } = SONS[som];
  notas.forEach((hz, i) => {
    if (!ctx) return;
    const quando = agora + i * passo;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = hz;
    env.gain.setValueAtTime(0, quando);
    env.gain.linearRampToValueAtTime(VOLUME, quando + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, quando + passo * 1.4);
    osc.connect(env).connect(ctx.destination);
    osc.start(quando);
    osc.stop(quando + passo * 1.5);
  });
}
