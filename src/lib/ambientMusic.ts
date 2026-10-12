/**
 * Trilha ambiente do aparelho: uma melodia original em estilo chiptune,
 * sintetizada na hora com a Web Audio API — não há arquivo de áudio.
 *
 * Toca baixinho e em laço. O navegador só libera som depois de um gesto da
 * pessoa, então quem chama `startMusic` é o primeiro clique ou tecla (ver
 * `MusicToggle`). A preferência fica no localStorage, como a da scanline.
 *
 * Se existir um arquivo `tema.mp3` ou `tema.m4a` em `public/audio/`, é ele que toca, e a
 * melodia sintetizada fica de reserva (ver `public/audio/LEIA-ME.txt`).
 */
const KEY = "pokedex:musica";

/** Volume do conjunto: som de fundo, abaixo do grito dos Pokémon. */
const VOLUME = 0.05;
/** Faixa opcional, posta por quem mantém o site; sem ela vale a síntese. */
const ARQUIVOS = ["/audio/tema.mp3", "/audio/tema.m4a"];
/** Volume do arquivo: uma gravação soa mais alta que três osciladores. */
const VOLUME_ARQUIVO = 0.02;
/** Segundos de fade no começo e no fim da faixa, para o laço não estalar. */
const FADE = 2.5;
/** Duração de um passo (colcheia), em segundos — cerca de 86 bpm. */
const PASSO = 0.35;
const PASSOS_POR_COMPASSO = 8;

/** Melodia, em notas MIDI; 0 é pausa. Oito compassos sobre C, Am, F e G. */
export const MELODIA: number[][] = [
  [76, 0, 79, 0, 84, 0, 79, 76],
  [81, 0, 76, 0, 72, 0, 76, 0],
  [77, 0, 81, 0, 84, 81, 77, 0],
  [74, 0, 79, 0, 83, 0, 86, 0],
  [88, 0, 86, 84, 79, 0, 76, 0],
  [84, 0, 81, 0, 76, 0, 81, 0],
  [81, 79, 77, 0, 72, 0, 77, 0],
  [79, 0, 74, 0, 79, 0, 0, 0],
];
/** Baixo de cada compasso (a fundamental) e o arpejo que o acompanha. */
const BAIXO = [48, 45, 41, 43, 48, 45, 41, 43];
const ARPEJO: number[][] = [
  [60, 64, 67],
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62],
  [60, 64, 67],
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62],
];

export const midiParaHz = (nota: number) => 440 * 2 ** ((nota - 69) / 12);

export function readMusic(): boolean {
  try {
    // Ligada por padrão: só fica muda se a pessoa tiver mutado.
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

function saveMusic(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Sem persistência a preferência vale só nesta visita.
  }
}

/** O que a pessoa pediu: ligada ou muda, toque o que tocar. */
let ligada = false;
/** Decidido na primeira partida: o arquivo, se carregar; senão a síntese. */
let fonte: "arquivo" | "sintese" | null = null;
let faixa: HTMLAudioElement | null = null;
/** Arquivo ainda carregando: enquanto houver um, não se começa outro. */
let candidata: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let saida: GainNode | null = null;
let relogio: number | null = null;
let passo = 0;
let proximo = 0;

function nota(tipo: OscillatorType, midi: number, quando: number, duracao: number, forca: number) {
  if (!ctx || !saida) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = midiParaHz(midi);
  // Ataque curto e cauda suave: sem isso cada nota estala.
  env.gain.setValueAtTime(0, quando);
  env.gain.linearRampToValueAtTime(forca, quando + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, quando + duracao);
  osc.connect(env).connect(saida);
  osc.start(quando);
  osc.stop(quando + duracao + 0.02);
}

function agendar() {
  if (!ctx) return;
  // Agenda um pouco à frente do relógio do áudio: o setInterval atrasa, o
  // AudioContext não.
  while (proximo < ctx.currentTime + 0.4) {
    const compasso = Math.floor(passo / PASSOS_POR_COMPASSO) % MELODIA.length;
    const i = passo % PASSOS_POR_COMPASSO;
    const m = MELODIA[compasso][i];
    if (m) nota("square", m, proximo, PASSO * 1.6, 0.22);
    if (i === 0 || i === 4) nota("triangle", BAIXO[compasso], proximo, PASSO * 3.2, 0.9);
    if (i % 2 === 1) nota("triangle", ARPEJO[compasso][((i - 1) / 2) % 3], proximo, PASSO * 1.2, 0.35);
    proximo += PASSO;
    passo++;
  }
}

/**
 * Volume da faixa conforme a posição: sobe nos primeiros segundos, desce nos
 * últimos. Assim a volta ao início passa pelo silêncio em vez de cortar.
 */
export function volumeNoLaco(tempo: number, duracao: number, cheio: number, fade = FADE): number {
  // Faixa curta demais para dois fades, ou duração ainda desconhecida.
  if (!Number.isFinite(duracao) || duracao < fade * 2) return cheio;
  const borda = Math.min(tempo, duracao - tempo);
  return cheio * Math.min(1, Math.max(0, borda / fade));
}

function prepararLaco(audio: HTMLAudioElement): void {
  // Sem `loop`: o laço nativo emenda o fim no começo no volume cheio.
  audio.loop = false;
  const ajustar = () => {
    audio.volume = volumeNoLaco(audio.currentTime, audio.duration, VOLUME_ARQUIVO);
  };
  audio.addEventListener("timeupdate", ajustar);
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    if (ligada) void audio.play();
  });
  ajustar();
}

/** Liga a trilha. Precisa vir de um gesto da pessoa, ou o navegador barra. */
export function startMusic(): void {
  saveMusic(true);
  ligada = true;
  if (fonte === "sintese") return ligarSintese();
  if (fonte === "arquivo") {
    void faixa?.play();
    return;
  }
  // Dois gestos seguidos (clique e tecla) não podem abrir duas faixas: a
  // segunda ficaria tocando sem que o botão de mutar a alcançasse.
  if (candidata) return;
  // Primeira partida: tenta os arquivos, um por vez. Se nenhum existir (ou
  // vier o index.html do fallback da SPA no lugar), o play rejeita e a
  // síntese assume.
  tentarArquivo(0);
}

function tentarArquivo(i: number): void {
  if (i >= ARQUIVOS.length) {
    candidata = null;
    fonte = "sintese";
    if (ligada) ligarSintese();
    return;
  }
  const audio = new Audio(ARQUIVOS[i]);
  candidata = audio;
  // Começa em silêncio; o fade de entrada sobe o volume.
  audio.volume = 0;
  prepararLaco(audio);
  audio.play().then(
    () => {
      candidata = null;
      fonte = "arquivo";
      faixa = audio;
      if (!ligada) audio.pause();
    },
    () => {
      // Arquivo que não tocou não fica pendurado à espera de dados.
      audio.pause();
      audio.removeAttribute("src");
      tentarArquivo(i + 1);
    }
  );
}

function ligarSintese(): void {
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  if (!ctx) {
    ctx = new Ctor();
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 2400; // tira o brilho da onda quadrada
    saida = ctx.createGain();
    saida.gain.value = 0;
    saida.connect(filtro).connect(ctx.destination);
  }
  void ctx.resume();
  if (!saida) return;
  saida.gain.cancelScheduledValues(ctx.currentTime);
  saida.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.4);
  if (relogio === null) {
    proximo = ctx.currentTime + 0.1;
    relogio = window.setInterval(agendar, 100);
    agendar();
  }
}

/** Muta: some em fade e para de agendar notas. */
export function stopMusic(): void {
  saveMusic(false);
  ligada = false;
  faixa?.pause();
  candidata?.pause();
  if (relogio !== null) {
    window.clearInterval(relogio);
    relogio = null;
  }
  if (ctx && saida) {
    saida.gain.cancelScheduledValues(ctx.currentTime);
    saida.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  }
}

export const isMusicPlaying = () => ligada;
/** De onde vem o som nesta visita; `null` antes da primeira partida. */
export const musicSource = () => fonte;

/** Aba escondida: suspende o áudio; de volta à vista, retoma. */
export function pauseForHiddenTab(hidden: boolean): void {
  if (!ligada) return;
  if (faixa) {
    if (hidden) faixa.pause();
    else void faixa.play();
  }
  if (!ctx || relogio === null) return;
  if (hidden) void ctx.suspend();
  else void ctx.resume();
}

// Em desenvolvimento, o HMR troca este módulo por uma cópia nova, de estado
// zerado. Sem calar a antiga, a faixa seguiria tocando órfã, fora do alcance
// do botão de mutar.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    faixa?.pause();
    candidata?.pause();
    if (relogio !== null) window.clearInterval(relogio);
    void ctx?.close();
  });
}
