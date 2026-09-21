import { useEffect, useRef, useState } from "react";

/**
 * Gamepad fisico.
 *
 * A Gamepad API nao emite evento por botao: so entrega um retrato do estado
 * quando perguntamos. Entao lemos por frame e comparamos com o retrato
 * anterior, traduzindo a diferenca em press/release para o core — que e a forma
 * que ele entende, a mesma do gamepad virtual de toque.
 *
 * ### O laco so roda com controle conectado
 *
 * A versao anterior chamava `navigator.getGamepads()` a cada quadro sempre,
 * mesmo sem controle nenhum ligado — e esse e o caso comum. `getGamepads()`
 * nao devolve uma referencia viva: ele monta objetos novos a cada chamada.
 *
 * O emulador divide com esta pagina o mesmo orcamento de quadro, entao tudo
 * que se gasta aqui sai da emulacao. Agora o laco nasce parado e so liga
 * quando o navegador avisa que um controle apareceu (`gamepadconnected`),
 * desligando quando o ultimo sai. Sem controle, o custo por quadro e zero.
 *
 * O mapeamento segue o layout "standard" da especificacao, que e o que o
 * navegador entrega para qualquer controle reconhecido (Xbox, DualShock,
 * genericos). Controles fora desse layout aparecem com `mapping: ""` e sao
 * ignorados: adivinhar indice de botao daria um controle que faz outra coisa.
 */

/** indice no layout standard -> acao do console. */
const BUTTON_MAP: Record<number, string> = {
  0: "A", // cruz / A
  1: "B", // circulo / B
  4: "L",
  5: "R",
  6: "L", // gatilhos tambem, para quem prefere
  7: "R",
  8: "Select",
  9: "Start",
  12: "Up",
  13: "Down",
  14: "Left",
  15: "Right",
};

/** Eixos do analogico esquerdo viram direcional acima deste limiar. */
const AXIS_DEADZONE = 0.5;

export interface GamepadApi {
  press: (button: string) => void;
  release: (button: string) => void;
}

/**
 * Le o gamepad enquanto `active` for true. Devolve o nome do controle ligado,
 * para a tela poder dizer que ele foi reconhecido.
 */
export function useGamepad(api: GamepadApi, active: boolean): string | null {
  const [connected, setConnected] = useState<string | null>(null);
  // press/release vem de useCallback no hook do emulador, mas guardamos em ref
  // para o loop nao precisar ser recriado — recriar o rAF a cada render
  // perderia o estado do frame anterior e faria o botao repetir.
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  useEffect(() => {
    if (!active || typeof navigator.getGamepads !== "function") return;

    let frame = 0;
    // Estado do frame anterior: acao -> estava pressionada?
    const held = new Map<string, boolean>();

    const setHeld = (button: string, down: boolean) => {
      if ((held.get(button) ?? false) === down) return;
      held.set(button, down);
      if (down) apiRef.current.press(button);
      else apiRef.current.release(button);
    };

    const poll = () => {
      const pads = navigator.getGamepads();
      const pad = pads.find((p) => p && p.mapping === "standard") ?? null;
      setConnected(pad ? pad.id : null);

      if (pad) {
        // Um mesmo botao pode ter duas origens (d-pad e analogico; L e LT):
        // juntamos por OR antes de decidir, senao uma origem solta o que a
        // outra esta segurando.
        const wanted = new Map<string, boolean>();
        const want = (button: string, down: boolean) =>
          wanted.set(button, (wanted.get(button) ?? false) || down);

        for (const [index, button] of Object.entries(BUTTON_MAP)) {
          want(button, pad.buttons[Number(index)]?.pressed ?? false);
        }
        const [x = 0, y = 0] = pad.axes;
        want("Left", x < -AXIS_DEADZONE);
        want("Right", x > AXIS_DEADZONE);
        want("Up", y < -AXIS_DEADZONE);
        want("Down", y > AXIS_DEADZONE);

        for (const [button, down] of wanted) setHeld(button, down);
      } else if (held.size > 0) {
        // Controle desconectado no meio: soltar tudo, ou o jogo fica com um
        // botao preso para sempre.
        for (const [button, down] of held) {
          if (down) apiRef.current.release(button);
        }
        held.clear();
      }

      frame = requestAnimationFrame(poll);
    };

    let rodando = false;

    /** Ha algum controle no layout standard agora? */
    const temControle = () =>
      Array.from(navigator.getGamepads()).some(
        (p) => p && p.mapping === "standard"
      );

    /** Idempotente: o evento de conexao pode repetir. */
    const ligar = () => {
      if (rodando) return;
      rodando = true;
      frame = requestAnimationFrame(poll);
    };

    const desligar = () => {
      if (!rodando) return;
      rodando = false;
      cancelAnimationFrame(frame);
      setConnected(null);
      for (const [button, down] of held) {
        if (down) apiRef.current.release(button);
      }
      held.clear();
    };

    // No evento de desconexao o controle que saiu ainda aparece na lista, e
    // por isso a decisao olha o conjunto inteiro em vez do que saiu.
    const aoDesconectar = () => {
      if (!temControle()) desligar();
    };

    window.addEventListener("gamepadconnected", ligar);
    window.addEventListener("gamepaddisconnected", aoDesconectar);
    // Um controle ja ligado antes desta tela montar nao dispara o evento.
    if (temControle()) ligar();

    return () => {
      window.removeEventListener("gamepadconnected", ligar);
      window.removeEventListener("gamepaddisconnected", aoDesconectar);
      desligar();
    };
  }, [active]);

  return connected;
}
