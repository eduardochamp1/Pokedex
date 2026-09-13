import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  applyKeyBindings,
  loadBindings,
  rebind,
  resetBindings,
  saveBindings,
  type KeyBinding,
} from "./keyBindings";
import type { mGBAEmulator } from "./types";

/**
 * O mapa de teclas em vigor e como ele chega ao core.
 *
 * Separado do `useEmulator` porque e um estado do teclado de quem joga, nao do
 * emulador: sobrevive a trocar de jogo, nao depende de haver ROM carregada, e
 * a unica conversa com o core e "escreva este mapa".
 */
export function useKeyBindings(
  coreRef: RefObject<mGBAEmulator | null>,
  notify: (message: string) => void
) {
  const [bindings, setBindings] = useState<KeyBinding[]>(loadBindings);
  /**
   * O core precisa saber quais teclas SAIRAM do mapa para solta-las; sem o
   * anterior, a tecla antiga continuaria disparando junto com a nova.
   */
  const appliedRef = useRef<KeyBinding[] | null>(null);
  /** `attach` roda uma vez: precisa do mapa atual, nao do primeiro render. */
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  /** Escreve o mapa no core assim que ele fica pronto. */
  const attach = useCallback((core: mGBAEmulator) => {
    const initial = bindingsRef.current;
    applyKeyBindings(core, initial);
    appliedRef.current = initial;
  }, []);

  // Reaplica sempre que o mapa muda. So depois de `attach`, porque antes disso
  // nao ha core para escrever.
  useEffect(() => {
    const core = coreRef.current;
    if (!core || appliedRef.current === null) return;
    if (appliedRef.current === bindings) return;
    applyKeyBindings(core, bindings, appliedRef.current);
    appliedRef.current = bindings;
  }, [coreRef, bindings]);

  /**
   * Troca a tecla de uma acao. Se a tecla ja era de outra, as duas trocam —
   * ver `rebind`.
   */
  const rebindKey = useCallback((button: string, sdlKey: string) => {
    setBindings((current) => {
      const next = rebind(current, button, sdlKey);
      if (next === current) return current;
      saveBindings(next);
      return next;
    });
  }, []);

  const resetKeyBindings = useCallback(() => {
    setBindings(resetBindings());
    notify("Teclas de volta ao padrão.");
  }, [notify]);

  return { bindings, rebindKey, resetKeyBindings, attach };
}
