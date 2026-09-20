/**
 * Os ajustes do core, alinhados com a implementação de referência.
 *
 * **Origem: gbajs3**, não o mGBA de mesa. O `@thenick775/mgba-wasm` não é uma
 * biblioteca solta — é o core extraído do gbajs3, emulador web completo do
 * mesmo autor. O README do pacote diz na primeira seção: *"This core currently
 * powers gbajs3"*. É a única implementação pública que exercita este build
 * exato em produção.
 *
 * ### Por que não o `config.ini` do mGBA de mesa
 *
 * Uma versão anterior deste arquivo copiou o `config.ini` de um mGBA 0.10.5
 * instalado, com o raciocínio de que "o core é o mesmo dos dois lados, então a
 * configuração atravessa inteira". **Não atravessa.** O mGBA de mesa é um app
 * Qt nativo com pacing próprio e com um fast-forward que sabe suspender o
 * `audioSync` ao acelerar. O build wasm é dirigido por fora e não tem essa
 * lógica: ligar `audioSync` aqui amarra o vídeo ao consumo de áudio em tempo
 * real, e o jogo passa a não ter como acelerar — só o resampler acelera.
 *
 * Era essa a causa de "a barra de velocidade só acelera o áudio, o jogo às
 * vezes dá uma arrancada e às vezes fica lento".
 *
 * ### Onde divergimos da referência, de propósito
 *
 * `allowOpposingDirections` é o único: gbajs3 deixa ligado, nós desligamos.
 * Não é desempenho, é jogabilidade — o hardware de um GBA não registra esquerda
 * e direita ao mesmo tempo, e jogos de Gen 3 têm truques que dependem disso.
 * O mGBA de mesa também desliga (`allowOpposingDirections=0`).
 */
import type { coreSettings } from "@thenick775/mgba-wasm";

/**
 * Os defaults do gbajs3, com uma divergência deliberada.
 *
 * | ajuste | gbajs3 | aqui | por quê |
 * |---|---|---|---|
 * | `audioSync` | false | false | ligado, trava a aceleração |
 * | `videoSync` | false | false | — |
 * | `timestepSync` | true | true | passo fixo de 1/60 s; é o que o multiplicador escala |
 * | `baseFpsTarget` | 60 | 60 | — |
 * | `frameSkip` | 0 | 0 | — |
 * | `audioSampleRate` | 48000 | 48000 | o que este build espera |
 * | `audioBufferSize` | 1024 | 1024 | o que este build espera |
 * | `allowOpposingDirections` | true | **false** | jogabilidade de GBA |
 */
export const MGBA_CORE_SETTINGS: coreSettings = {
  audioSync: false,
  videoSync: false,
  timestepSync: true,
  baseFpsTarget: 60,
  frameSkip: 0,
  audioSampleRate: 48000,
  audioBufferSize: 1024,
  allowOpposingDirections: false,
};

