import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  DEFAULT_AV,
  appendLog,
  isAvSettings,
  isShown,
  type AvSettings,
  type LogLine,
} from "./diagnostics";
import { loadPref, savePref } from "./prefs";
import type { mGBAEmulator } from "./types";

/**
 * Chave versionada de propósito.
 *
 * A `av-settings` original gravava `audioSync: true`, herdado do `config.ini`
 * do mGBA de mesa — e era esse valor que travava a barra de velocidade. Uma
 * preferência antiga tem formato perfeitamente válido, então passaria pelo
 * `isAvSettings` e venceria o padrão novo: quem já abriu a aba continuaria com
 * o bug, e trocar o default não teria efeito nenhum.
 *
 * Subir a chave aposenta a preferência antiga em vez de migrá-la campo a campo.
 * O custo é quem tinha ajustado A/V na mão voltar ao padrão uma vez — barato,
 * perto de deixar o freio ligado sem que ninguém perceba.
 *
 * A **v3** existe pelo mesmo motivo, com outro campo: o passo fixo saiu do
 * painel (ver `AvSettings`), e uma preferência v2 com `timestepSync: false`
 * gravado continuaria válida para o `isAvSettings` novo — campo a mais não
 * reprova — e seria aplicada inteira pelo `setCoreSettings`. Quem tivesse
 * desmarcado aquela caixa ficaria com o jogo a 6,8× para sempre, sem nenhum
 * interruptor na tela para desfazer.
 */
const AV_PREF = "av-settings-v3";

/**
 * De quanto em quanto tempo o log acumulado vira estado do React.
 *
 * O core fala na cadencia da emulacao, e o painel nao precisa dessa cadencia:
 * ninguem le 200 linhas por segundo. Com o estado atualizado por linha, cada
 * mensagem renderizava a PlayPage inteira e o emulador ficava sem o orcamento
 * de quadro — era esse o teto de 1,0–1,4x no turbo.
 *
 * 250 ms da quatro atualizacoes por segundo, que para ler e de sobra, e mantem
 * o custo do painel constante por mais falante que o jogo seja. O filtro de
 * nivel (`isShown`) ja corta o grosso; isto e o que segura uma enxurrada de
 * WARN, que o filtro deixa passar de proposito.
 */
const FLUSH_MS = 250;

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
   * O log de verdade mora aqui; `log` e o espelho que a tela le.
   *
   * O core escreve nesta ref na cadencia dele, sem passar pelo React, e a
   * descarga agendada copia o resultado para o estado.
   */
  const linhasRef = useRef<LogLine[]>([]);
  const descargaRef = useRef<number | undefined>(undefined);

  /**
   * Liga o log e aplica os ajustes gravados, quando o core fica pronto.
   *
   * O log fica ligado desde a inicializacao, para que o que veio ANTES de uma
   * falha ja esteja gravado — um log que so liga depois do problema nao serve.
   */
  const attach = useCallback((core: mGBAEmulator) => {
    core.setCoreSettings(avRef.current);
    core.setLogger((entry) => {
      // Primeira camada, e a mais barata: o que nao vai para a tela nem chega
      // a virar objeto. Um logger que so descarta custa zero mesmo a mil
      // linhas por segundo — medido.
      if (!isShown(entry.level)) return;
      linhasRef.current = appendLog(linhasRef.current, entry);
      // Segunda camada: uma renderizacao por janela, nao por linha. O timer
      // pendente ja cobre tudo o que chegar ate ele disparar.
      if (descargaRef.current !== undefined) return;
      descargaRef.current = window.setTimeout(() => {
        descargaRef.current = undefined;
        setLog(linhasRef.current);
      }, FLUSH_MS);
    });
  }, []);

  // O core sobrevive a desmontagem da pagina, mas o timer nao pode: sair de
  // /jogar com uma descarga pendente chamaria `setLog` em componente morto.
  useEffect(
    () => () => {
      if (descargaRef.current !== undefined) {
        window.clearTimeout(descargaRef.current);
        descargaRef.current = undefined;
      }
    },
    []
  );

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

  /** Limpar tem que esvaziar a ref junto, senao a proxima descarga ressuscita. */
  const clearLog = useCallback(() => {
    linhasRef.current = [];
    if (descargaRef.current !== undefined) {
      window.clearTimeout(descargaRef.current);
      descargaRef.current = undefined;
    }
    setLog([]);
  }, []);

  return { av, setAv, log, clearLog, attach };
}
