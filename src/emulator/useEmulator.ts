import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  checkIsolation,
  coreVersion,
  getCanvas,
  getCore,
  getLoadedRom,
  setLoadedRom,
  getWasRunning,
  setWasRunning,
} from "./core";
import {
  applyKeyBindings,
  loadBindings,
  rebind,
  resetBindings,
  saveBindings,
  type KeyBinding,
} from "./keyBindings";
import {
  listLocalSaves,
  readLocalSave,
  requestPersistence,
  formatBytes,
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
import {
  deleteStateFile,
  readStateEntries,
  slotsForRom,
  type SlotInfo,
} from "./saveStates";
import {
  REWIND_SETTINGS,
  readStateThumbnail,
  screenshotFileName,
  stateThumbnailName,
} from "./capture";
import { TURBO_MULTIPLIER } from "./shortcuts";
import {
  DEFAULT_AV,
  appendLog,
  isAvSettings,
  type AvSettings,
  type LogLine,
} from "./diagnostics";
import { loadPref, savePref } from "./prefs";

import {
  forgetLastRom,
  getFastForward,
  getLastRom,
  getVolume,
  rememberFastForward,
  rememberLastRom,
  rememberVolume,
} from "./session";

/** Chave das preferencias de audio/video. */
const AV_PREF = "av-settings";

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
  const [volume, setVolumeState] = useState(getVolume);
  const [fastForward, setFastForwardState] = useState(getFastForward);
  const [notice, setNotice] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  /** null = pasta saves/ indisponível (produção). */
  const [localSaves, setLocalSaves] = useState<LocalSave[] | null>(null);
  /** Os seis slots com o estado real lido do FS do core. */
  const [slots, setSlots] = useState<SlotInfo[]>(() => slotsForRom([], undefined));
  /**
   * Estado automático do jogo atual, se o core já capturou um. O core tira um a
   * cada 30 s mas nunca o oferecia: ficava gravado e era descartado na próxima
   * sessão.
   */
  const [autoState, setAutoState] = useState<{ name: string; size: number } | null>(
    null
  );
  /** Mapa de teclas em vigor — o padrão com o que estiver remapeado por cima. */
  const [bindings, setBindings] = useState<KeyBinding[]>(loadBindings);
  /**
   * O core precisa saber quais teclas SAÍRAM do mapa para soltá-las; sem o
   * anterior, a tecla antiga continuaria disparando junto com a nova.
   */
  const appliedBindingsRef = useRef<KeyBinding[] | null>(null);
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  /** Rebobinando neste instante — a tela precisa mostrar que está. */
  const [rewinding, setRewinding_] = useState(false);
  /** Turbo segurado neste instante — a barra de velocidade mostra isso. */
  const [turboActive, setTurboActive] = useState(false);
  /** Sincronia de áudio/vídeo e contador de FPS. */
  const [av, setAvState] = useState<AvSettings>(
    () => loadPref(AV_PREF, isAvSettings) ?? DEFAULT_AV
  );
  /** Log do core. Fica sempre ligado: quando algo falha, já está gravado. */
  const [log, setLog] = useState<LogLine[]>([]);
  /** A inicializacao roda uma vez: precisa do valor atual, nao do primeiro. */
  const avRef = useRef(av);
  avRef.current = av;
  const lastBackupRef = useRef(0);
  /**
   * O callback do core e registrado uma vez na inicializacao; a ref evita
   * recriar aquele efeito so porque o backup mudou de identidade.
   */
  const backupToDiskRef = useRef<
    ((rom: string, opts?: { force?: boolean }) => Promise<boolean>) | null
  >(null);
  /** Mesma razão: a inicialização roda uma vez e precisa da versão atual. */
  const resumeLastRomRef = useRef<((rom: string) => void) | null>(null);
  /**
   * O status corrente para a limpeza ler. O efeito de inicialização tem deps
   * vazias, então o `status` que ele fecharia é o da primeira renderização.
   */
  const statusRef = useRef(status);
  statusRef.current = status;

  /** Relê do sistema de arquivos do core o que existe guardado. */
  const refreshLibrary = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    try {
      const gamePath = core.filePaths().gamePath;
      setRoms(
        core
          .listRoms()
          .filter(isSupportedRom)
          .map((fileName) => {
            let size: number | undefined;
            try {
              size = (core.FS.stat(`${gamePath}/${fileName}`) as { size?: number })
                .size;
            } catch {
              // sem stat: a lista continua valendo, só sem o tamanho
            }
            return { fileName, origin: "upload" as const, size };
          })
      );
      // listSaves devolve o diretório cru, com as entradas "." e ".." do FS.
      setSaves(core.listSaves().filter((name) => name !== "." && name !== ".."));
    } catch {
      // FS ainda nao pronto — a proxima chamada resolve
    }
    // Os slots saem do diretório de estados, e a ROM corrente vem do módulo e
    // não do state: refreshLibrary é chamado de dentro de callbacks que foram
    // criados antes do setStatus, então o status aqui estaria atrasado.
    // A miniatura entra aqui e não em slotsForRom porque ler o FS é efeito —
    // slotsForRom continua sendo só o cruzamento, testável sem core.
    const rom = getLoadedRom() ?? undefined;
    setSlots(
      slotsForRom(readStateEntries(core), rom).map((slot) =>
        slot.exists && rom
          ? { ...slot, thumbnail: readStateThumbnail(core, rom, slot.slot) }
          : slot
      )
    );
    try {
      const auto = core.getAutoSaveState();
      setAutoState(
        auto ? { name: auto.autoSaveStateName, size: auto.data.length } : null
      );
    } catch {
      setAutoState(null);
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
          // A cada captura automática (30 s) o painel de estados se atualiza —
          // senão "Continuar de onde parou" só apareceria ao trocar de jogo.
          autoSaveStateCapturedCallback: () => refreshLibrary(),
        });
        // Bindings explicitos: a legenda da UI le do mesmo mapa.
        // bindingsRef e não `bindings`: este efeito roda uma vez, e o que vale
        // na inicialização é o que foi carregado do localStorage.
        const initial = bindingsRef.current;
        applyKeyBindings(core, initial);
        appliedBindingsRef.current = initial;
        core.setCoreSettings({
          autoSaveStateEnable: true,
          autoSaveStateTimerIntervalSeconds: 30,
          restoreAutoSaveStateOnLoad: false,
          // O buffer de rebobinar já existia no core e nunca era ligado.
          ...REWIND_SETTINGS,
          ...avRef.current,
        });

        // O log do core ia para lugar nenhum. Ligado desde o início, para que
        // quando algo falhar o que veio antes já esteja gravado.
        core.setLogger((entry) => setLog((lines) => appendLog(lines, entry)));
        // O core pode ja estar com jogo carregado de uma montagem anterior
        // (navegar para fora e voltar). A limpeza pausou; se estava rodando,
        // voltamos a rodar — ter que clicar "Continuar" ao voltar de uma busca
        // e atrito puro.
        const previous = getLoadedRom();
        if (previous) {
          if (getWasRunning()) {
            core.resumeGame();
            core.resumeAudio();
            setStatus({ kind: "running", rom: previous });
          } else {
            setStatus({ kind: "paused", rom: previous });
          }
          refreshLibrary();
          return;
        }

        // Sem jogo no core: ou e a primeira visita, ou a pagina foi recarregada
        // e o core morreu junto. A ROM continua no IndexedDB — recarregamos a
        // ultima, para nao obrigar a passear pela biblioteca de novo.
        const last = getLastRom();
        const inLibrary = last !== undefined && core.listRoms().includes(last);
        if (inLibrary) {
          void resumeLastRomRef.current?.(last);
          return;
        }
        setStatus({ kind: "ready" });
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
          // Guarda se estava rodando ANTES de pausar — é o que a próxima
          // montagem usa para decidir se volta rodando.
          setWasRunning(statusRef.current.kind === "running");
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
      // Volume E velocidade: a barra guardava 5x e o jogo novo entrava em 1x.
      core.setVolume(volume / 100);
      core.setFastForwardMultiplier(fastForward);
      rememberLastRom(flatName);
      setLoadedRom(flatName);
      setStatus({ kind: "running", rom: flatName });
      refreshLibrary();
    },
    [refreshLibrary, volume, fastForward]
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
      // Volume E velocidade: a barra guardava 5x e o jogo novo entrava em 1x.
      core.setVolume(volume / 100);
      core.setFastForwardMultiplier(fastForward);
      rememberLastRom(fileName);
      setLoadedRom(fileName);
      setStatus({ kind: "running", rom: fileName });
      refreshLibrary();
    },
    [refreshLibrary, volume, fastForward]
  );

  /**
   * Recarrega a última ROM depois de a página ter sido recarregada, já no
   * ponto automático quando existe um.
   *
   * Só entra quando o core está sem jogo E a ROM ainda está na biblioteca — e
   * "Fechar jogo" esquece a ROM, então quem fechou de propósito não é trazido
   * de volta. Nunca é silencioso: o aviso diz o que foi retomado, senão o jogo
   * apareceria adiantado sem explicação.
   */
  const resumeLastRom = useCallback(
    async (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      const ok = core.loadGame(`${core.filePaths().gamePath}/${fileName}`);
      if (!ok) {
        // A ROM sumiu ou está corrompida: esquecer evita repetir a falha em
        // toda visita.
        forgetLastRom();
        setStatus({ kind: "ready" });
        refreshLibrary();
        return;
      }
      core.setVolume(volume / 100);
      core.setFastForwardMultiplier(fastForward);
      setLoadedRom(fileName);

      await core.FSSync();
      setStatus({ kind: "running", rom: fileName });

      // O ponto automático NÃO é aplicado aqui de propósito. `loadAutoSaveState`
      // recusa logo depois de um `loadGame` — medido no browser: pelo botão da
      // tela, com o jogo já rodando, funciona; na mesma volta do carregamento,
      // devolve false mesmo tentando de novo por segundos. Então o jogo volta do
      // começo e quem decide retomar é quem está jogando, no botão que já existe.
      const hasAuto = core.getAutoSaveState() !== null;
      setNotice(
        hasAuto
          ? `${fileName} recarregado. Use "Continuar de onde parou" para voltar ao ponto automático.`
          : `${fileName} recarregado. Use "Fechar jogo" se não quiser que ele volte sozinho.`
      );
      refreshLibrary();
    },
    [refreshLibrary, volume, fastForward]
  );

  useEffect(() => {
    resumeLastRomRef.current = resumeLastRom;
  }, [resumeLastRom]);

  /**
   * Remove uma ROM da biblioteca do navegador.
   *
   * A biblioteca so crescia: cada ROM enviada ficava no IndexedDB para sempre,
   * a 16-32 MB por jogo de GBA, sem nenhuma forma de limpar pela tela.
   *
   * O save de bateria e os save states NAO sao apagados junto — sao o
   * progresso, e quem tira a ROM da lista quase nunca quer perder o jogo
   * salvo. Se a mesma ROM voltar, o progresso volta com ela.
   */
  const deleteRom = useCallback(
    async (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      if (fileName === getLoadedRom()) {
        setNotice(`Feche ${fileName} antes de removê-lo da biblioteca.`);
        return;
      }
      try {
        core.FS.unlink(`${core.filePaths().gamePath}/${fileName}`);
        await core.FSSync();
      } catch (error) {
        setNotice(
          `Não deu para remover ${fileName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return;
      }
      // Sem isso a próxima visita tentaria recarregar uma ROM que não existe.
      if (getLastRom() === fileName) forgetLastRom();
      refreshLibrary();
      setNotice(`${fileName} removido da biblioteca. O save foi mantido.`);
    },
    [refreshLibrary]
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
    // Fechar é dizer que não quer este jogo de volta na próxima visita — sem
    // isso, retomar automático seria uma decisão impossível de desfazer.
    setWasRunning(false);
    forgetLastRom();
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
      // Miniatura junto com o estado: a data diz quando, a imagem diz onde —
      // e é a imagem que faz reconhecer o slot certo de relance.
      const rom = getLoadedRom();
      if (ok && rom) core.screenshot(stateThumbnailName(rom, slot));
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

  /** Apaga o estado de um slot e devolve o painel ao real. */
  const clearState = useCallback(
    async (slot: SaveStateSlot) => {
      const core = coreRef.current;
      const rom = getLoadedRom();
      if (!core || !rom) return;
      const removed = deleteStateFile(core, rom, slot);
      if (removed) {
        // A miniatura vai junto: imagem órfã apontaria para um estado que já
        // não existe.
        try {
          core.FS.unlink(
            `${core.filePaths().screenshotsPath}/${stateThumbnailName(rom, slot)}`
          );
        } catch {
          // estado antigo, gravado antes de haver miniatura
        }
        await core.FSSync();
      }
      refreshLibrary();
      setNotice(
        removed ? `Slot ${slot} apagado.` : `Slot ${slot} já estava vazio.`
      );
    },
    [refreshLibrary]
  );

  /**
   * Retoma do estado automático — o que o core vinha gravando a cada 30 s e
   * que até agora era descartado sem nunca ser oferecido.
   */
  const loadAutoState = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    const ok = core.loadAutoSaveState();
    setNotice(
      ok
        ? "Retomado do estado automático."
        : "Não havia estado automático para este jogo."
    );
  }, []);

  /** Força uma captura automática agora, sem gastar um dos seis slots. */
  const captureAutoState = useCallback(async () => {
    const core = coreRef.current;
    if (!core) return;
    const ok = core.forceAutoSaveState();
    await core.FSSync();
    refreshLibrary();
    setNotice(ok ? "Ponto automático capturado." : "Não deu para capturar.");
  }, [refreshLibrary]);

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

  // Reaplica o mapa sempre que ele muda. Roda depois da inicialização porque
  // depende de coreRef, que só existe quando o core termina de subir.
  useEffect(() => {
    const core = coreRef.current;
    if (!core || appliedBindingsRef.current === null) return;
    if (appliedBindingsRef.current === bindings) return;
    applyKeyBindings(core, bindings, appliedBindingsRef.current);
    appliedBindingsRef.current = bindings;
  }, [bindings]);

  /**
   * Troca a tecla de uma ação. Se a tecla já era de outra, as duas trocam —
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
    setNotice("Teclas de volta ao padrão.");
  }, []);

  const setVolume = useCallback((percent: number) => {
    setVolumeState(percent);
    rememberVolume(percent);
    coreRef.current?.setVolume(percent / 100);
  }, []);

  const setFastForward = useCallback((multiplier: number) => {
    setFastForwardState(multiplier);
    rememberFastForward(multiplier);
    coreRef.current?.setFastForwardMultiplier(multiplier);
  }, []);

  /**
   * Turbo momentâneo, enquanto a tecla estiver segurada.
   *
   * Fala direto com o core e não passa por `setFastForward`: a barra de
   * velocidade é a preferência de quem joga e é gravada — o turbo é um impulso
   * e não pode sobrescrevê-la. Ao soltar, volta para o que a barra diz.
   */
  const setTurbo = useCallback(
    (active: boolean) => {
      coreRef.current?.setFastForwardMultiplier(
        active ? TURBO_MULTIPLIER : fastForward
      );
      setTurboActive(active);
    },
    [fastForward]
  );

  /** Pressiona/solta um botão pelo gamepad virtual (toque). */
  const pressButton = useCallback((button: string) => {
    coreRef.current?.buttonPress(button);
  }, []);
  const releaseButton = useCallback((button: string) => {
    coreRef.current?.buttonUnpress(button);
  }, []);

  // O gamepad físico usa o mesmo caminho do gamepad de toque. O objeto precisa
  // ser estável: o loop de leitura roda por frame e não pode ser remontado a
  // cada render, ou perde o estado do frame anterior.
  const gamepadApi = useMemo(
    () => ({ press: pressButton, release: releaseButton }),
    [pressButton, releaseButton]
  );

  /**
   * Rebobina enquanto estiver segurado.
   *
   * É segurar e soltar, não ligar e desligar: rebobinar é uma correção de
   * curso — você volta olhando a tela e larga no ponto certo. Um botão de
   * liga/desliga faria o jogo andar para trás sozinho até alguém lembrar.
   */
  const setRewinding = useCallback((active: boolean) => {
    coreRef.current?.toggleRewind(active);
    setRewinding_(active);
  }, []);

  /**
   * Tira um PNG da tela e entrega como download.
   *
   * O core escreve no FS virtual; daqui lemos de volta e entregamos. Ficar só
   * no FS seria guardar uma captura que ninguém consegue alcançar.
   */
  const takeScreenshot = useCallback(
    async (romName: string) => {
      const core = coreRef.current;
      if (!core) return;
      const fileName = screenshotFileName(romName, new Date());
      if (!core.screenshot(fileName)) {
        setNotice("O core não conseguiu capturar a tela.");
        return;
      }
      await core.FSSync();
      try {
        const path = `${core.filePaths().screenshotsPath}/${fileName}`;
        const data = core.FS.readFile(path) as Uint8Array;
        // Mesmo motivo do exportSave: o buffer pode ser SharedArrayBuffer, que
        // o Blob não aceita.
        const copy = new Uint8Array(data.length);
        copy.set(data);
        const url = URL.createObjectURL(new Blob([copy], { type: "image/png" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        setNotice(`${fileName} salvo (${formatBytes(copy.length)}).`);
      } catch (error) {
        setNotice(
          `A captura foi feita mas não deu para ler de volta: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    []
  );

  /**
   * Liga/desliga a entrada no core. Usado enquanto a tela espera uma tecla
   * nova: sem isso, a tecla escolhida também iria para o jogo.
   */
  const setInputEnabled = useCallback((enabled: boolean) => {
    coreRef.current?.toggleInput(enabled);
  }, []);

  /**
   * Liga/desliga uma sincronia ou o contador de FPS.
   *
   * `setCoreSettings` aceita um objeto parcial, mas mandamos o conjunto todo:
   * assim o que esta em vigor no core e sempre o que a tela mostra, sem
   * depender de o core lembrar o que foi enviado antes.
   */
  const setAv = useCallback((patch: Partial<AvSettings>) => {
    setAvState((current) => {
      const next = { ...current, ...patch };
      savePref(AV_PREF, next);
      coreRef.current?.setCoreSettings(next);
      return next;
    });
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

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
    /** O canvas singleton, para quem precisa medi-lo (escala, tela cheia). */
    canvas: getCanvas(),
    status,
    version,
    roms,
    localRoms,
    saves,
    volume,
    fastForward,
    notice,
    dismissNotice: () => setNotice(null),
    /** Para quem dirige partes da tela de fora daqui (escala, tela cheia). */
    notify: setNotice,
    playFile,
    playStored,
    deleteRom,
    playLocal,
    pause,
    resume,
    reset,
    stop,
    saveState,
    loadState,
    clearState,
    slots,
    autoState,
    loadAutoState,
    captureAutoState,
    exportSave,
    importSave,
    setVolume,
    setFastForward,
    sync,
    pressButton,
    releaseButton,
    bindings,
    rebindKey,
    resetKeyBindings,
    setInputEnabled,
    /** Estável: o loop do gamepad não pode ser recriado a cada render. */
    gamepadApi,
    rewinding,
    turboActive,
    av,
    setAv,
    log,
    clearLog,
    setTurbo,
    setRewinding,
    takeScreenshot,
    storage,
    localSaves,
    refreshLocalRoms,
    backupToDisk,
    restoreFromDisk,
  };
}
