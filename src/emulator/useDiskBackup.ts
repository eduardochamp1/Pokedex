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
      if (!data || data.length === 0) {
        // Clique manual sem dado nao pode ser silencioso: alguns jogos (e ROMs
        // de teste) simplesmente nao tem SRAM de bateria.
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
        if (opts.force) {
          notify(`${fileName} copiado para saves/ (${data.length} bytes).`);
        }
        return true;
      } catch (error) {
        if (opts.force) {
          notify(
            `Não deu para gravar em saves/: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
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
