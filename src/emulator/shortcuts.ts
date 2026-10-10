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
  | { kind: "turbo" }
  | { kind: "rewind" };

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

  // Rebobinar so tinha o botao de segurar com o mouse: quem joga no teclado
  // nao alcancava. R nao esta no mapa padrao, e quem o der ao jogo fica com o
  // jogo — a mesma regra do Espaco.
  if (key === "r" || key === "R") {
    return boundKeys.has("R") ? null : { kind: "rewind" };
  }

  const fn = /^F([1-9]|1[0-2])$/.exec(key);
  if (!fn) return null;
  const slot = Number(fn[1]);
  if (slot > MAX_SLOT) return null;
  if (boundKeys.has(key)) return null;

  return shiftKey ? { kind: "save", slot } : { kind: "load", slot };
}

/**
 * Multiplicador enquanto o turbo esta segurado.
 *
 * Era 5, e 5 nao era escolha: era o teto do que a pagina conseguia entregar
 * enquanto o log do core renderizava a PlayPage a cada linha. Com aquilo
 * resolvido (ver `isShown` em diagnostics.ts), o core passou a obedecer, e o
 * numero pode voltar a ser uma escolha.
 *
 * Medido em Emerald, contando quadros **emulados** por `keysReadCallback`,
 * quatro amostras de 2,5 s por ponto:
 *
 * | pedido | entregue (media) | pior amostra |
 * |---|---|---|
 * | 5x | 5,01x | 4,98x |
 * | 8x | 8,17x | 7,84x |
 * | **10x** | **9,91x** | 8,99x |
 * | 12x | 9,89x | 8,16x |
 *
 * 10 e onde esta maquina satura: 12 nao entrega mais nada e so aumenta a
 * dispersao, e mais acima piora de verdade (a 80 caiu para 7,6x). Pedir acima
 * do que a maquina aguenta **nao** e de graca — o core tenta e se atrapalha.
 *
 * Numa maquina mais lenta isto degrada sozinho, como o 5 degradava antes: o
 * core entrega o que conseguir. Por isso um numero fixo, e nao uma regua: o
 * teto e da maquina, e nao ha o que a pessoa possa escolher melhor que ela.
 */
export const TURBO_MULTIPLIER = 10;

/**
 * A faixa da barra de velocidade.
 *
 * O topo é o mesmo do turbo, e pelo mesmo motivo medido acima: 10 é onde esta
 * máquina satura, e pedir mais **piora** — o core tenta e se atrapalha. Numa
 * máquina mais lenta a barra degrada sozinha, entregando o que der.
 *
 * O piso é 1, e não um valor abaixo: o core aceita multiplicador **negativo**
 * para câmera lenta (o gbajs3 testa `getFastForwardMultiplier() < -1`), e isso
 * funciona na 2.5.0 — mas a escala não foi medida aqui. Medir antes de expor.
 */
export const VELOCIDADE_MIN = 1;
export const VELOCIDADE_MAX = 10;

/** Legenda dos atalhos, para a tela poder ensina-los sem repetir a regra. */
export const SHORTCUT_HELP = [
  { keys: "F1–F6", keysEn: "F1–F6", what: "carregar o estado do slot", whatEn: "load the slot's state" },
  { keys: "Shift + F1–F6", keysEn: "Shift + F1–F6", what: "gravar no slot", whatEn: "save to the slot" },
  { keys: "Espaço", keysEn: "Space", what: "turbo enquanto segura", whatEn: "turbo while held" },
  { keys: "R", keysEn: "R", what: "rebobinar enquanto segura", whatEn: "rewind while held" },
] as const;
