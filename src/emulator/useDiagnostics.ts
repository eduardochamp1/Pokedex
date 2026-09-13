import { useCallback, useRef, useState, type RefObject } from "react";
import {
  DEFAULT_AV,
  appendLog,
  isAvSettings,
  type AvSettings,
  type LogLine,
} from "./diagnostics";
import { loadPref, savePref } from "./prefs";
import type { mGBAEmulator } from "./types";

const AV_PREF = "av-settings";

/**
 * Sincronia de audio/video, contador de FPS e o log do core.
 *
 * Separado do `useEmulator` porque nao tem relacao com o ciclo de vida do
 * core nem com jogo carregado: sao preferencias da maquina de quem joga e um
 * fluxo de mensagens que corre em paralelo a tudo.
 */
export function useDiagnostics(coreRef: RefObject<mGBAEmulator | null>) {
  const [av, setAvState] = useState<AvSettings>(
    () => loadPref(AV_PREF, isAvSettings) ?? DEFAULT_AV
  );
  const [log, setLog] = useState<LogLine[]>([]);
  /** `attach` roda uma vez: precisa do valor atual, nao do primeiro render. */
  const avRef = useRef(av);
  avRef.current = av;

  /**
   * Liga o log e aplica os ajustes gravados, quando o core fica pronto.
   *
   * O log fica ligado desde a inicializacao, para que o que veio ANTES de uma
   * falha ja esteja gravado — um log que so liga depois do problema nao serve.
   */
  const attach = useCallback((core: mGBAEmulator) => {
    core.setCoreSettings(avRef.current);
    core.setLogger((entry) => setLog((lines) => appendLog(lines, entry)));
  }, []);

  /**
   * Liga/desliga uma sincronia ou o contador de FPS.
   *
   * `setCoreSettings` aceita um objeto parcial, mas mandamos o conjunto todo:
   * assim o que esta em vigor no core e sempre o que a tela mostra, sem
   * depender de o core lembrar o que foi enviado antes.
   */
  const setAv = useCallback(
    (patch: Partial<AvSettings>) => {
      setAvState((current) => {
        const next = { ...current, ...patch };
        savePref(AV_PREF, next);
        coreRef.current?.setCoreSettings(next);
        return next;
      });
    },
    [coreRef]
  );

  const clearLog = useCallback(() => setLog([]), []);

  return { av, setAv, log, clearLog, attach };
}
