import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  listLocalSaves,
  readLocalSave,
  saveNameFor,
  writeLocalSave,
  type LocalSave,
} from "./storage";
import type { mGBAEmulator } from "./types";

/**
 * Ha progresso de verdade nestes bytes?
 *
 * O guard original testava so `length === 0`, e isso nao pega o caso comum. A
 * flash de um jogo de Gen 3 tem o tamanho certo — 131072 bytes — antes de o
 * jogo gravar qualquer coisa. Esse buffer passava pela checagem, virava arquivo
 * em `saves/` e o dono ficava com algo que parece progresso e nao e.
 *
 * **Nao basta rejeitar zeros.** Medido nos quatro saves deste repositorio:
 * `Pokemon - Emerald.sav` e uniforme `0x00`, mas os de Leaf Green, Rocket e
 * Unbound sao uniformes `0xFF` — flash apagada, que e o outro estado virgem.
 * Um teste de "tem algum byte diferente de zero" aprovaria os tres.
 *
 * Entao o criterio e "nao e uniforme": buffer em que todo byte e igual nao
 * carrega informacao nenhuma, seja 0x00, 0xFF ou o que for. Continua sendo uma
 * checagem generica de proposito, sem olhar assinatura de formato — vale igual
 * para GB, GBC e GBA, e nao precisa saber de qual geracao e o jogo. Validar por
 * assinatura de setor pertence ao parsing de save, que e outro assunto.
 */
export function hasRealSaveData(
  data: Uint8Array | undefined | null
): data is Uint8Array {
  if (!data || data.length === 0) return false;
  const primeiro = data[0];
  return data.some((byte) => byte !== primeiro);
}

/**
 * Espelho dos saves na pasta `saves/` do projeto.
 *
 * Essa e a garantia forte de durabilidade: o IndexedDB sobrevive a recarregar
 * mas pode ser descartado pelo navegador; arquivo em disco, nao. A pasta so
 * existe em dev e preview — em producao `localSaves` fica null e tudo aqui vira
 * silencio, sem quebrar nada.
 *
 * Vive fora do `useEmulator` porque nao depende do ciclo de vida do core: e uma
 * conversa com o servidor de desenvolvimento, com o core entrando so como fonte
 * dos bytes.
 */
export function useDiskBackup(
  coreRef: RefObject<mGBAEmulator | null>,
  notify: (message: string) => void,
  refreshLibrary: () => void
) {
  /** null = pasta `saves/` indisponivel (producao). */
  const [localSaves, setLocalSaves] = useState<LocalSave[] | null>(null);
  const lastBackupRef = useRef(0);
  /** A gravacao anterior falhou? Evita repetir o aviso a cada cinco segundos. */
  const falhouAntesRef = useRef(false);

  const refreshLocalSaves = useCallback(async () => {
    setLocalSaves(await listLocalSaves());
  }, []);

  useEffect(() => {
    void refreshLocalSaves();
  }, [refreshLocalSaves]);

  const backupToDisk = useCallback(
    async (romName: string, opts: { force?: boolean } = {}) => {
      const core = coreRef.current;
      if (!core || localSaves === null) return false;

      // Throttle: o core dispara saveDataUpdated com frequencia.
      const now = Date.now();
      if (!opts.force && now - lastBackupRef.current < 5000) return false;
      lastBackupRef.current = now;

      const data = core.getSave();
      if (!hasRealSaveData(data)) {
        // Clique manual sem dado nao pode ser silencioso: alguns jogos (e ROMs
        // de teste) simplesmente nao tem SRAM de bateria, e um jogo que ainda
        // nao gravou tem a flash alocada e zerada — que nao e progresso.
        if (opts.force) {
          notify(
            "Este jogo ainda não gravou nada — não há save de bateria para copiar."
          );
        }
        return false;
      }

      const fileName = saveNameFor(romName);
      try {
        await writeLocalSave(fileName, data);
        await refreshLocalSaves();
        falhouAntesRef.current = false;
        if (opts.force) {
          notify(`${fileName} copiado para saves/ (${data.length} bytes).`);
        }
        return true;
      } catch (error) {
        const motivo =
          error instanceof Error ? error.message : String(error);
        // O backup automatico falhando em silencio e o pior caso: quem joga
        // acredita que o progresso esta espelhado em disco e nao esta. Antes,
        // o aviso so saia no clique manual.
        //
        // Avisa uma vez por sequencia de falhas, e nao a cada gravacao: o core
        // dispara saveDataUpdated com frequencia, e repetir o aviso a cada
        // cinco segundos viraria ruido que a pessoa aprende a ignorar.
        if (opts.force || !falhouAntesRef.current) {
          notify(`Não deu para gravar ${fileName} em saves/: ${motivo}`);
        }
        falhouAntesRef.current = true;
        return false;
      }
    },
    [coreRef, localSaves, notify, refreshLocalSaves]
  );

  /** Traz um save da pasta `saves/` para dentro do core. */
  const restoreFromDisk = useCallback(
    async (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      try {
        const bytes = await readLocalSave(fileName);
        const file = new File([bytes], fileName);
        await new Promise<void>((done) =>
          core.uploadSaveOrSaveState(file, done)
        );
        await core.FSSync();
        refreshLibrary();
        notify(
          `"${fileName}" restaurado da pasta saves/. Recarregue o jogo para valer.`
        );
      } catch (error) {
        notify(
          `Não deu para restaurar ${fileName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    [coreRef, notify, refreshLibrary]
  );

  return { localSaves, refreshLocalSaves, backupToDisk, restoreFromDisk };
}
