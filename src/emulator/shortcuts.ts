/**
 * Atalhos de teclado da tela de jogo.
 *
 * Gravar e carregar estado exigiam achar o slot certo na barra lateral com o
 * mouse — no meio de um trecho dificil, isso e largar o controle. F1-F6
 * carregam, Shift+F1-F6 gravam, e o turbo fica em segurar a barra de espaco.
 *
 * A escolha de teclas evita o que o jogo usa: nenhum F e nenhuma barra de
 * espaco esta no mapa padrao. Quem remapear uma acao para uma delas ganha o
 * jogo, nao o atalho — quem escolheu a tecla para o jogo quis o jogo.
 */

export type Shortcut =
  | { kind: "save"; slot: number }
  | { kind: "load"; slot: number }
  | { kind: "turbo" };

/** Os seis slots que a tela oferece; F7+ nao vira atalho. */
const MAX_SLOT = 6;

/**
 * Elemento onde a tecla e texto, e por isso nao pode virar atalho.
 *
 * ### Por que `BUTTON` e `A` saiam daqui e voltaram a nao sair
 *
 * A primeira versao incluia os dois, para nao roubar de um botao focado a
 * barra de espaco — que e como o navegador aciona botoes. A regra parecia
 * certa e custava caro: **para comecar a jogar a pessoa clica num botao**
 * ("Continuar de onde parou", uma ROM da biblioteca, "Pausar"), o foco fica
 * nele, e o Espaco seguinte morria aqui. O turbo nunca ligava — e, pior, o
 * Espaco reacionava aquele mesmo botao. Era essa a causa de "no emulador de
 * PC segurar Espaco acelera e aqui nao".
 *
 * Tentar resolver movendo o foco para o palco funciona no caso feliz, mas
 * depende de acertar todo caminho que devolve o foco a um botao — e basta um
 * escapar para o turbo sumir de novo. Entao os dois sairam da lista: com um
 * jogo rodando, o Espaco e do jogo. Quem chama o atalho da `preventDefault()`,
 * o que impede o botao focado de ser acionado, e Enter continua acionando
 * botoes normalmente — a navegacao por teclado segue inteira.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Traduz uma tecla em atalho, ou null se aquela tecla nao e atalho.
 *
 * `boundKeys` sao as teclas ja vinculadas a acoes do console: se a pessoa
 * remapeou algo para F3, F3 tem que ir para o jogo.
 */
export function shortcutFor(
  event: { key: string; shiftKey: boolean },
  boundKeys: ReadonlySet<string> = new Set()
): Shortcut | null {
  const { key, shiftKey } = event;

  if (key === " " || key === "Spacebar") {
    return boundKeys.has("Space") ? null : { kind: "turbo" };
  }

  const fn = /^F([1-9]|1[0-2])$/.exec(key);
  if (!fn) return null;
  const slot = Number(fn[1]);
  if (slot > MAX_SLOT) return null;
  if (boundKeys.has(key)) return null;

  return shiftKey ? { kind: "save", slot } : { kind: "load", slot };
}

/** Multiplicador enquanto o turbo esta segurado. */
export const TURBO_MULTIPLIER = 5;

/** Legenda dos atalhos, para a tela poder ensina-los sem repetir a regra. */
export const SHORTCUT_HELP = [
  { keys: "F1–F6", what: "carregar o estado do slot" },
  { keys: "Shift + F1–F6", what: "gravar no slot" },
  { keys: "Espaço", what: "turbo enquanto segura" },
] as const;
