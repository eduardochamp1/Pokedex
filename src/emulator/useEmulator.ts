import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkIsolation,
  coreVersion,
  getCanvas,
  getCore,
  getLoadedRom,
  setLoadedRom,
} from "./core";
import { applyKeyBindings } from "./keyBindings";
import {
  listLocalSaves,
  readLocalSave,
  requestPersistence,
  saveNameFor,
  writeLocalSave,
  type LocalSave,
  type StorageStatus,
} from "./storage";
import {
  isSupportedRom,
  type EmulatorStatus,
  type RomEntry,
  type SaveStateSlot,
  type mGBAEmulator,
} from "./types";

interface LocalRom {
  fileName: string;
  size: number;
}

/**
 * Resolve para true se a promise terminar no prazo, false se estourar.
 *
 * Os callbacks de upload do core nao disparam quando a escrita no FS falha —
 * sem teto, a UI fica presa em "Carregando..." sem dizer nada.
 */
async function withTimeout(promise: Promise<void>, ms: number): Promise<boolean> {
  let timer: number | undefined;
  const timeout = new Promise<false>((done) => {
    timer = window.setTimeout(() => done(false), ms);
  });
  try {
    return await Promise.race([promise.then(() => true), timeout]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

/**
 * Dirige o core mGBA a partir de um canvas.
 *
 * Persistencia: `FSInit` monta IDBFS, entao ROMs enviadas, saves de bateria e
 * save states ficam no IndexedDB do navegador. `FSSync()` e o que grava —
 * chamamos depois de cada operacao que muda arquivo, e no callback que o core
 * dispara quando o jogo grava save.
 */
export function useEmulator() {
  /** Container onde o canvas persistente e adotado. */
  const stageRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<mGBAEmulator | null>(null);
  const [status, setStatus] = useState<EmulatorStatus>({ kind: "checking" });
  const [version, setVersion] = useState<string>("");
  const [roms, setRoms] = useState<RomEntry[]>([]);
  /** null = pasta roms/ indisponível (produção); [] = pasta vazia. */
  const [localRoms, setLocalRoms] = useState<LocalRom[] | null>(null);
  const [saves, setSaves] = useState<string[]>([]);
  const [volume, setVolumeState] = useState(100);
  const [fastForward, setFastForwardState] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  /** null = pasta saves/ indisponível (produção). */
  const [localSaves, setLocalSaves] = useState<LocalSave[] | null>(null);
  const lastBackupRef = useRef(0);
  /**
   * O callback do core e registrado uma vez na inicializacao; a ref evita
   * recriar aquele efeito so porque o backup mudou de identidade.
   */
  const backupToDiskRef = useRef<
    ((rom: string, opts?: { force?: boolean }) => Promise<boolean>) | null
  >(null);

  /** Relê do sistema de arquivos do core o que existe guardado. */
  const refreshLibrary = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    try {
      setRoms(
        core
          .listRoms()
          .filter(isSupportedRom)
          .map((fileName) => ({ fileName, origin: "upload" as const }))
      );
      // listSaves devolve o diretório cru, com as entradas "." e ".." do FS.
      setSaves(core.listSaves().filter((name) => name !== "." && name !== ".."));
    } catch {
      // FS ainda nao pronto — a proxima chamada resolve
    }
  }, []);

  // Pede armazenamento persistente e mede o uso, para a UI poder dizer a
  // verdade sobre a durabilidade em vez de o usuario ter que adivinhar.
  useEffect(() => {
    let alive = true;
    void requestPersistence().then((s) => {
      if (alive) setStorage(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const refreshLocalSaves = useCallback(async () => {
    const list = await listLocalSaves();
    setLocalSaves(list);
  }, []);

  useEffect(() => {
    void refreshLocalSaves();
  }, [refreshLocalSaves]);

  /**
   * Rele a pasta roms/. Exposto porque o manifesto e lido no carregamento —
   * sem isso, largar uma ROM nova na pasta nao mostra nada e parece defeito.
   */
  const refreshLocalRoms = useCallback(async () => {
    try {
      const res = await fetch("/local-roms.json");
      if (!res.ok) return;
      const list: unknown = await res.json();
      if (Array.isArray(list)) setLocalRoms(list as LocalRom[]);
    } catch {
      // Em producao o endpoint nao existe: seguimos so com o seletor.
    }
  }, []);

  useEffect(() => {
    void refreshLocalRoms();
  }, [refreshLocalRoms]);

  // Voltar para a aba e o momento tipico de ter acabado de copiar arquivos.
  useEffect(() => {
    const onFocus = () => {
      void refreshLocalRoms();
      void refreshLocalSaves();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshLocalRoms, refreshLocalSaves]);

  // Inicializacao: checa isolamento, cria o core, monta o FS.
  useEffect(() => {
    const isolation = checkIsolation();
    if (!isolation.ok) {
      setStatus({
        kind: "unsupported",
        reason: !isolation.webAssembly
          ? "Este navegador não tem WebAssembly."
          : "Esta página não está cross-origin isolated.",
        detail: !isolation.webAssembly
          ? "Sem WebAssembly não há como rodar o core."
          : `O core usa threads, e threads exigem SharedArrayBuffer — que o navegador só libera com os headers Cross-Origin-Opener-Policy: same-origin e Cross-Origin-Embedder-Policy: require-corp. ` +
            `Estado atual: crossOriginIsolated=${isolation.crossOriginIsolated}, SharedArrayBuffer=${isolation.sharedArrayBuffer}.`,
      });
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    // O canvas vive fora do React: aqui so o adotamos no container.
    const canvas = getCanvas();
    if (canvas.parentElement !== stage) stage.appendChild(canvas);

    let disposed = false;
    setStatus({ kind: "loading" });

    getCore().then(
      (core) => {
        coreRef.current = core;
        if (disposed) return;
        setVersion(coreVersion(core));
        core.addCoreCallbacks({
          // O jogo gravou save: persiste no IndexedDB e espelha em disco.
          saveDataUpdatedCallback: () => {
            core.FSSync().catch(() => undefined);
            const rom = getLoadedRom();
            if (rom) void backupToDiskRef.current?.(rom);
          },
          coreCrashedCallback: () => {
            setStatus({
              kind: "error",
              message: "O core travou. Recarregue a página para tentar de novo.",
            });
          },
        });
        // Bindings explicitos: a legenda da UI le do mesmo mapa.
        applyKeyBindings(core);
        core.setCoreSettings({
          autoSaveStateEnable: true,
          autoSaveStateTimerIntervalSeconds: 30,
          restoreAutoSaveStateOnLoad: false,
        });
        // O core pode ja estar com jogo carregado de uma montagem anterior
        // (navegar para fora e voltar). A limpeza pausou, entao voltamos
        // pausados em vez de mentir "nenhum jogo carregado".
        const previous = getLoadedRom();
        setStatus(previous ? { kind: "paused", rom: previous } : { kind: "ready" });
        refreshLibrary();
      },
      (error: unknown) => {
        if (disposed) return;
        setStatus({
          kind: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    );

    return () => {
      disposed = true;
      // O core e singleton da sessao — derrubar aqui mataria o runtime que a
      // proxima montagem vai reaproveitar. Pausa e grava o progresso.
      const core = coreRef.current;
      if (core) {
        try {
          core.pauseGame();
          core.pauseAudio();
          void core.FSSync();
        } catch {
          // sem jogo carregado: nada a pausar
        }
      }
    };
  }, [refreshLibrary]);

  /**
   * Espelha o save de bateria na pasta `saves/` do projeto.
   *
   * Essa e a garantia forte de durabilidade: o IndexedDB sobrevive a recarregar
   * mas pode ser descartado pelo navegador; arquivo em disco, nao. Silencioso
   * em producao, onde a rota nao existe.
   */
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
          setNotice(
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
          setNotice(`${fileName} copiado para saves/ (${data.length} bytes).`);
        }
        return true;
      } catch (error) {
        if (opts.force) {
          setNotice(
            `Não deu para gravar em saves/: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
        return false;
      }
    },
    [localSaves, refreshLocalSaves]
  );

  useEffect(() => {
    backupToDiskRef.current = backupToDisk;
  }, [backupToDisk]);

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
        setNotice(
          `"${fileName}" restaurado da pasta saves/. Recarregue o jogo para valer.`
        );
      } catch (error) {
        setNotice(
          `Não deu para restaurar ${fileName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    [refreshLibrary]
  );

  /** Sobe uma ROM para o FS do core e inicia o jogo. */
  const playFile = useCallback(
    async (file: File) => {
      const core = coreRef.current;
      if (!core) return;
      if (!isSupportedRom(file.name)) {
        setNotice(`"${file.name}" não é .gb, .gbc nem .gba.`);
        return;
      }
      setNotice(null);
      setStatus({ kind: "loading" });

      // O sistema de arquivos do core e plano. Se o nome carregar subpasta
      // ("gb/jogo.gb"), uploadRom tenta escrever em /data/games/gb/, que nao
      // existe — a escrita falha e o callback nunca dispara, deixando a tela
      // em "Carregando..." para sempre. Entao dentro do core usamos o basename.
      const flatName = file.name.replace(/^.*[/\\]/, "");
      const flatFile =
        flatName === file.name ? file : new File([file], flatName);

      const uploaded = await withTimeout(
        new Promise<void>((done) => core.uploadRom(flatFile, done)),
        15000
      );
      if (!uploaded) {
        setStatus({
          kind: "error",
          message: `O core não confirmou a gravação de ${flatName}. Tente de novo.`,
        });
        return;
      }
      await core.FSSync();

      const ok = core.loadGame(`${core.filePaths().gamePath}/${flatName}`);
      if (!ok) {
        setStatus({ kind: "error", message: `Não deu para carregar ${flatName}.` });
        return;
      }
      core.setVolume(volume / 100);
      setLoadedRom(flatName);
      setStatus({ kind: "running", rom: flatName });
      refreshLibrary();
    },
    [refreshLibrary, volume]
  );

  /** Roda uma ROM que já está guardada no FS do core. */
  const playStored = useCallback(
    (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      setNotice(null);
      const ok = core.loadGame(`${core.filePaths().gamePath}/${fileName}`);
      if (!ok) {
        setStatus({ kind: "error", message: `Não deu para carregar ${fileName}.` });
        return;
      }
      core.setVolume(volume / 100);
      setLoadedRom(fileName);
      setStatus({ kind: "running", rom: fileName });
      refreshLibrary();
    },
    [refreshLibrary, volume]
  );

  /** Puxa uma ROM da pasta local roms/ e joga. */
  const playLocal = useCallback(
    async (fileName: string) => {
      setNotice(null);
      setStatus({ kind: "loading" });
      try {
        const res = await fetch(`/local-roms/${encodeURIComponent(fileName)}`);
        if (!res.ok) throw new Error(`servidor respondeu ${res.status}`);
        const buffer = await res.arrayBuffer();
        await playFile(new File([buffer], fileName));
      } catch (error) {
        setStatus({
          kind: "error",
          message: `Não deu para ler ${fileName} da pasta roms/ (${
            error instanceof Error ? error.message : String(error)
          }).`,
        });
      }
    },
    [playFile]
  );

  const pause = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    core.pauseGame();
    setStatus((s) => (s.kind === "running" ? { kind: "paused", rom: s.rom } : s));
  }, []);

  const resume = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    core.resumeGame();
    setStatus((s) => (s.kind === "paused" ? { kind: "running", rom: s.rom } : s));
  }, []);

  const reset = useCallback(() => {
    coreRef.current?.quickReload();
    setNotice("Jogo reiniciado.");
  }, []);

  const stop = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    core.quitGame();
    core.FSSync().catch(() => undefined);
    setLoadedRom(null);
    setStatus({ kind: "ready" });
    refreshLibrary();
  }, [refreshLibrary]);

  /**
   * Usamos saveStateSlot/loadStateSlot, que a tipagem do core marca como
   * "deprecated, prefira saveState/loadState" — porque na mGBA-wasm 2.5.1 as
   * recomendadas simplesmente nao funcionam. Verificado no browser:
   *
   *   saveState(4)     -> 0, nenhum arquivo escrito
   *   saveStateSlot(5) -> 1, grava e loga "[Status/INFO] State 5 saved"
   *   loadState(5)     -> 0
   *   loadStateSlot(5) -> 1, loga screenshot/savedata/cheats/RTC + "State 5 loaded"
   *
   * Se uma versao futura corrigir as novas, vale voltar.
   */
  const saveState = useCallback(
    async (slot: SaveStateSlot) => {
      const core = coreRef.current;
      if (!core) return;
      const ok = core.saveStateSlot(slot);
      await core.FSSync();
      refreshLibrary();
      setNotice(
        ok ? `Estado gravado no slot ${slot}.` : `Falhou ao gravar o slot ${slot}.`
      );
    },
    [refreshLibrary]
  );

  const loadState = useCallback((slot: SaveStateSlot) => {
    const core = coreRef.current;
    if (!core) return;
    const ok = core.loadStateSlot(slot);
    setNotice(
      ok ? `Estado do slot ${slot} carregado.` : `Slot ${slot} está vazio.`
    );
  }, []);

  /** Baixa o save de bateria (.sav) do jogo em execução. */
  const exportSave = useCallback((romName: string) => {
    const core = coreRef.current;
    if (!core) return;
    const data = core.getSave();
    if (!data || data.length === 0) {
      setNotice("Este jogo ainda não gravou nada.");
      return;
    }
    // Copia para um ArrayBuffer proprio: o buffer do core pode ser um
    // SharedArrayBuffer, que o Blob nao aceita.
    const copy = new Uint8Array(data.length);
    copy.set(data);
    const url = URL.createObjectURL(new Blob([copy], { type: "application/octet-stream" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = romName.replace(/\.(gb|gbc|gba)$/i, "") + ".sav";
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Save exportado (${copy.length} bytes).`);
  }, []);

  /** Importa um .sav ou save state de arquivo. */
  const importSave = useCallback(
    async (file: File) => {
      const core = coreRef.current;
      if (!core) return;
      await new Promise<void>((done) => core.uploadSaveOrSaveState(file, done));
      await core.FSSync();
      refreshLibrary();
      setNotice(
        `"${file.name}" importado. Recarregue o jogo para o save valer.`
      );
    },
    [refreshLibrary]
  );

  const setVolume = useCallback((percent: number) => {
    setVolumeState(percent);
    coreRef.current?.setVolume(percent / 100);
  }, []);

  const setFastForward = useCallback((multiplier: number) => {
    setFastForwardState(multiplier);
    coreRef.current?.setFastForwardMultiplier(multiplier);
  }, []);

  /** Pressiona/solta um botão pelo gamepad virtual (toque). */
  const pressButton = useCallback((button: string) => {
    coreRef.current?.buttonPress(button);
  }, []);
  const releaseButton = useCallback((button: string) => {
    coreRef.current?.buttonUnpress(button);
  }, []);

  /** Grava o save pendente — útil antes de fechar a aba. */
  const sync = useCallback(async () => {
    await coreRef.current?.FSSync();
    setNotice("Progresso sincronizado.");
  }, []);

  // Garante que o save vai para o IndexedDB se a aba for fechada no meio.
  useEffect(() => {
    const onHide = () => {
      coreRef.current?.FSSync().catch(() => undefined);
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return {
    stageRef,
    status,
    version,
    roms,
    localRoms,
    saves,
    volume,
    fastForward,
    notice,
    dismissNotice: () => setNotice(null),
    playFile,
    playStored,
    playLocal,
    pause,
    resume,
    reset,
    stop,
    saveState,
    loadState,
    exportSave,
    importSave,
    setVolume,
    setFastForward,
    sync,
    pressButton,
    releaseButton,
    storage,
    localSaves,
    refreshLocalRoms,
    backupToDisk,
    restoreFromDisk,
  };
}
