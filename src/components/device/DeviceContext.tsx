import { createContext, useContext, useEffect, type MutableRefObject } from "react";

export type PaneSide = "left" | "right";

/** O que a página conta ao aparelho sobre si. */
export interface DevicePageConfig {
  /** Rótulos das duas abas do celular: [painel esquerdo, painel direito]. */
  labels: [string, string];
  /** Linha de cima do texto central do rodapé ("NO. 0025"). */
  footer?: string;
  /** Linha de baixo ("↑ ↓ NAVEGAR"). */
  hint?: string;
}

/** O que cada seta faz nesta página. Sem handler, a seta fica apagada. */
export interface DeviceHandlers {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export interface DeviceContextValue {
  pane: PaneSide;
  setPane: (side: PaneSide) => void;
  register: (config: DevicePageConfig | null) => void;
  handlersRef: MutableRefObject<DeviceHandlers>;
}

export const DeviceContext = createContext<DeviceContextValue | null>(null);

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice fora do <Device>");
  return ctx;
}

/**
 * A página se apresenta ao aparelho: rótulos do celular, texto do rodapé e o
 * que as setas do D-pad (e do teclado) fazem nela.
 *
 * Os handlers vão por ref, e não por estado: eles mudam a cada render (fecham
 * sobre a lista atual), e registrá-los como estado renderizaria o aparelho
 * inteiro a cada tecla.
 */
export function useDevicePage(config: DevicePageConfig & DeviceHandlers): Pick<DeviceContextValue, "pane" | "setPane"> {
  const { register, handlersRef, pane, setPane } = useDevice();
  const { labels, footer, hint, onUp, onDown, onLeft, onRight } = config;
  const [esq, dir] = labels;

  useEffect(() => {
    handlersRef.current = { onUp, onDown, onLeft, onRight };
  });

  useEffect(() => {
    register({ labels: [esq, dir], footer, hint });
    return () => register(null);
  }, [register, esq, dir, footer, hint]);

  // Sai da página: as setas voltam a não fazer nada.
  useEffect(() => {
    const ref = handlersRef;
    return () => {
      ref.current = {};
    };
  }, [handlersRef]);

  return { pane, setPane };
}
