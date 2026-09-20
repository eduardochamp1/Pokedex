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
 * Qt nativo com pacing próprio; o build wasm é dirigido por fora, e o que vale
 * para ele é o que o gbajs3 exercita em produção.
 *
 * `audioSync` fica desligado porque é assim no gbajs3. Ele não tem relação com
 * a aceleração: quem acelera é `setFastForwardMultiplier`, sozinho. Ver
 * `aplicarVelocidade` em `useEmulator.ts`.
 *
 * ### A versão está presa, e não é por conservadorismo
 *
 * O `package.json` fixa `@thenick775/mgba-wasm` em **2.5.0**, sem `^`.
 * **Não suba sem testar o turbo.** A 2.5.1 quebrou o
 * `setFastForwardMultiplier`: o multiplicador passa a não fazer nada, nem para
 * acelerar nem para desacelerar, e o jogo fica preso em 60 quadros por segundo
 * faça o que fizer. Isso custou três investigações inteiras antes de aparecer.
 *
 * Como conferir numa versão nova, em um minuto: com o jogo rodando, no console,
 * `__mgbaCore__.setFastForwardMultiplier(-5)`. O jogo tem que ficar
 * visivelmente lento. Se não ficar, a versão não serve.
 *
 * O `mgba.js` é idêntico entre 2.5.0 e 2.5.1 — só o `.wasm` mudou. A 2.5.0 não
 * declara `saveStateSlot`/`loadStateSlot` nas typings, embora as tenha em
 * tempo de execução; `types.ts` cobre isso.
 *
 * ### `baseFpsTarget` e `frameSkip` ficam de fora, e isso importa
 *
 * `setCoreSettings` só escreve as chaves definidas, então não listar um ajuste
 * é diferente de listá-lo com o valor "padrão": o que não vem aqui mantém o
 * que o core decidiu sozinho.
 *
 * Uma versão anterior escrevia `baseFpsTarget: 60`. **Um GBA não roda a 60
 * quadros por segundo, roda a 59,7275.** Forçar 60 faz o core produzir áudio
 * para uma taxa que o jogo não tem, e a diferença — meio por cento — vira
 * deriva audível depois de alguns minutos. Era essa a dessincronia do som.
 *
 * O gbajs3 não define nenhum dos dois, e é por isso que lá o som não deriva.
 * O nome do branch `core-settings-native-fps` no repositório do core diz de
 * onde vem o valor certo: do próprio jogo, não da nossa opinião.
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
 * | `audioSync` | false | false | — |
 * | `videoSync` | false | false | — |
 * | `timestepSync` | true | true | passo fixo; segura o jogo na velocidade certa |
 * | `baseFpsTarget` | **não define** | **não define** | ver abaixo |
 * | `frameSkip` | **não define** | **não define** | idem |
 * | `audioSampleRate` | 48000 | 48000 | o que este build espera |
 * | `audioBufferSize` | 1024 | 1024 | o que este build espera |
 * | `allowOpposingDirections` | true | **false** | jogabilidade de GBA |
 */
export const MGBA_CORE_SETTINGS: coreSettings = {
  audioSync: false,
  videoSync: false,
  timestepSync: true,
  audioSampleRate: 48000,
  audioBufferSize: 1024,
  allowOpposingDirections: false,
};

