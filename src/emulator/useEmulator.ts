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
  requestPersistence,
  formatBytes,
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
  autoStateFileName,
  deleteStateFile,
  readStateEntries,
  romBaseName,
  slotsForRom,
  type SlotInfo,
} from "./saveStates";
import {
  REWIND_SETTINGS,
  parseScreenshotName,
  readStateThumbnail,
  screenshotFileName,
  stateThumbnailName,
  toDataUrl,
} from "./capture";
import { GBA_HEADER_BYTES, identifyRom, type RomId } from "./romId";
import { parseGen3Save, type Gen3PartyMember } from "./saveParse/gen3";
import { recordPlayerDex } from "../lib/playerDex";
import { recordTrainerSave } from "../lib/trainerLog";
import { MGBA_CORE_SETTINGS } from "./mgbaDefaults";
import { TURBO_MULTIPLIER } from "./shortcuts";
import { useDiagnostics } from "./useDiagnostics";
import { useDiskBackup } from "./useDiskBackup";
import { useKeyBindings } from "./useKeyBindings";

import {
  forgetLastRom,
  getLastRom,
  getVolume,
  rememberLastRom,
  rememberVolume,
} from "./session";

interface LocalRom {
  fileName: string;
  size: number;
}

/**
 * Uma captura de tela guardada no FS do core.
 *
 * Só nome, data e tamanho — todos de `FS.stat`. A imagem é lida sob demanda:
 * dezenas de PNGs de 240×160 convertidos em base64 de uma vez são inofensivos,
 * centenas não.
 */
export interface Screenshot {
  fileName: string;
  when: Date;
  size?: number;
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
 * Grava o FS virtual no IndexedDB e devolve o motivo da falha, ou `null`.
 *
 * `FSSync()` **rejeita** quando `FS.syncfs` devolve erro — conferido no proprio
 * `mgba.js do pacote`. A causa comum e a cota do navegador cheia.
 *
 * Sem guarda, essa rejeicao virava rejeicao nao tratada e sumia: quem chama faz
 * `void emu.playFile(file)`, entao a tela ficava em "Carregando..." para sempre
 * e a unica saida era recarregar a pagina. Gravar um save state falhava do
 * mesmo jeito, so que sem mensagem nenhuma — o painel nao mudava e quem jogava
 * concluia que nao tinha funcionado e tentava de novo.
 *
 * Quem chama decide o peso: carregar e fatal e vira `status`; gravar, apagar e
 * importar sao recuperaveis e viram `notice`, sem derrubar o jogo.
 */
async function syncFs(core: mGBAEmulator | undefined): Promise<string | null> {
  if (!core) return null;
  try {
    await core.FSSync();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/**
 * Tamanho do estado automatico sem ler o arquivo inteiro.
 *
 * `getAutoSaveState()` devolve `{ autoSaveStateName, data }` e o painel so usa
 * `data.length`. Ler o estado inteiro — megabytes, dependendo do jogo — para
 * descobrir o tamanho dele custava caro, e isso rodava a cada 30 segundos na
 * mesma thread que desenha o canvas e conduz o core. `FS.stat` responde o mesmo
 * sem tocar no conteudo.
 *
 * O arquivo mora em `/autosave`, e nao no diretorio de estados: o core monta o
 * nome a partir do caminho do jogo e troca `/data/games/` por `/autosave/`.
 */
function autoStateInfo(
  core: mGBAEmulator,
  rom: string | undefined
): { name: string; size: number } | null {
  if (!rom) return null;
  const name = autoStateFileName(rom);
  try {
    const stat = core.FS.stat(`${core.filePaths().autosave}/${name}`) as {
      size?: number;
    };
    return stat?.size ? { name, size: stat.size } : null;
  } catch {
    return null;
  }
}

/**
 * Le so o cabecalho de uma ROM que ja esta no FS do core.
 *
 * `FS.readFile` traria o arquivo inteiro — 16 MB numa FireRed, 32 numa Unbound
 * — para olhar 192 bytes. `FS.open`/`FS.read` leem a janela que interessa e
 * nada mais; conferido no navegador, devolve 192 bytes de um arquivo de 16 MB.
 */
function lerCabecalho(
  core: mGBAEmulator,
  fileName: string
): Uint8Array | null {
  const caminho = `${core.filePaths().gamePath}/${fileName}`;
  const fs = core.FS as unknown as {
    open: (path: string, flags: string) => unknown;
    read: (
      stream: unknown,
      buffer: Uint8Array,
      offset: number,
      length: number,
      position: number
    ) => number;
    close: (stream: unknown) => void;
  };
  let stream: unknown;
  try {
    stream = fs.open(caminho, "r");
    const bytes = new Uint8Array(GBA_HEADER_BYTES);
    const lidos = fs.read(stream, bytes, 0, GBA_HEADER_BYTES, 0);
    return lidos === GBA_HEADER_BYTES ? bytes : null;
  } catch {
    return null;
  } finally {
    if (stream !== undefined) {
      try {
        fs.close(stream);
      } catch {
        // stream ja fechado ou FS indisponivel
      }
    }
  }
}

/**
 * Base ja lida de cada ROM da biblioteca, por nome de arquivo.
 *
 * `refreshLibrary` roda com frequencia e abrir um arquivo por ROM a cada
 * passagem seria trabalho repetido a toa: o cabecalho de um arquivo nao muda.
 * Uma leitura de 192 bytes por ROM, uma vez por sessao.
 */
const baseDaRom = new Map<
  string,
  { base?: string; versionGroupId?: string }
>();

function baseDe(
  core: mGBAEmulator,
  fileName: string
): { base?: string; versionGroupId?: string } {
  const cache = baseDaRom.get(fileName);
  if (cache) return cache;
  const id = identifyRom(lerCabecalho(core, fileName));
  const info = { base: id?.jogo, versionGroupId: id?.versionGroupId };
  baseDaRom.set(fileName, info);
  return info;
}

/**
 * Aplica a velocidade no core.
 *
 * Uma chamada, e só — `setFastForwardMultiplier`, que é o que o gbajs3 faz.
 * O resto é o mudo, que é conforto.
 *
 * ### Por que isso levou tanto tempo para funcionar
 *
 * O multiplicador **não fazia nada** neste projeto, em nenhum dos dois
 * sentidos, e três análises seguidas tentaram contornar isso mexendo em
 * `timestepSync`, `baseFpsTarget` e `setMainLoopTiming`. Nenhuma funcionou,
 * e desligar o passo fixo ainda deixava o jogo mais pesado.
 *
 * A causa não estava no código: **a versão 2.5.1 do core quebrou o
 * `setFastForwardMultiplier`.** O gbajs3 — mesma biblioteca, mesmo autor —
 * acelera de verdade porque serve a **2.5.0**. Isso foi confirmado por md5: o
 * `mgba.wasm` que o gbajs3 publica é byte a byte o da 2.5.0, e o nosso era o
 * da 2.5.1 (mesmo tamanho, 28 163 bytes diferentes). O `mgba.js` é idêntico
 * nas duas; só o wasm mudou.
 *
 * Por isso a versão está **presa em 2.5.0** no `package.json`. Ver
 * `mgbaDefaults.ts` antes de subir.
 *
 * ### Medido, contando quadros emulados
 *
 * O instrumento é `keysReadCallback`, que o core dispara uma vez por quadro
 * **emulado** — ao contrário do `showFpsCounter`, que conta o laço de render e
 * levou duas análises anteriores a conclusões erradas.
 *
 * | multiplicador | 2.5.0 | 2.5.1 |
 * |---|---|---|
 * | 1 | 66 qps | 60 qps |
 * | −5 (lento) | **29 qps** | 60 qps |
 * | 5 | **104 qps** | 60 qps |
 *
 * Na 2.5.1 o número não se move. Na 2.5.0 ele obedece nos dois sentidos.
 *
 * O teto para cima é a máquina, não o core: com 20 o número não passa de ~92,
 * igual ao de 5. Quem tiver CPU sobrando acelera mais; quem não tiver, menos.
 *
 * ### O que **não** entra aqui
 *
 * `setMainLoopTiming` acelera o laço da thread principal, que só desenha — a
 * emulação não escuta. Provado pelo teste do `quickReload()`: com
 * `SETIMMEDIATE` a abertura do jogo chega exatamente no mesmo ponto em 4 s.
 * Era ele que produzia as arrancadas aleatórias em velocidade normal.
 *
 * `timestepSync` fica como a pessoa deixou na tela de A/V. Desligá-lo no turbo
 * não acelerava e fazia o core mirar 300 quadros por segundo e falhar — daí a
 * sensação de "mais pesado e não acelera".
 */
function aplicarVelocidade(
  core: mGBAEmulator | null | undefined,
  turbo: boolean,
  prefs: { audioSync: boolean; timestepSync: boolean },
  volumeAntes: { current: number | null }
): void {
  if (!core) return;

  core.setFastForwardMultiplier(turbo ? TURBO_MULTIPLIER : 1);

  if (turbo) {
    if (volumeAntes.current === null) {
      const atual = core.getVolume();
      volumeAntes.current = typeof atual === "number" ? atual : null;
    }
    // Mudo enquanto acelera, como o `muteOnFastForward` do gbajs3 e como o
    // mGBA de mesa: o resampler acelerado vira chiado.
    core.setVolume(0);
    return;
  }

  // Fora da aceleração, a tela de A/V manda de novo.
  core.setCoreSettings({
    timestepSync: prefs.timestepSync,
    audioSync: prefs.audioSync,
  });
  if (volumeAntes.current !== null) {
    core.setVolume(volumeAntes.current);
    volumeAntes.current = null;
  }
}

/** Sufixo comum das mensagens: a cota e a causa provavel, e ela e visivel. */
const DICA_DE_COTA =
  "O mais provável é a cota do navegador estar cheia — veja “Onde ficam seus saves” no painel ao lado.";

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
  const [notice, setNotice] = useState<string | null>(null);
  /**
   * O jogo identificado pelo cabecalho do cartucho, quando da.
   *
   * Vale a BASE do cartucho, nao "o jogo": romhack tem cabecalho identico ao do
   * original. Quem manda na linha principal da tela continua sendo o nome do
   * arquivo — ver romId.ts.
   */
  const [romId, setRomId] = useState<RomId | null>(null);
  /**
   * As capturas que estão no FS do core.
   *
   * Até aqui a captura virava download e sumia da vista — mas o PNG ficava
   * gravado, e nada nunca o apagava: o `unlink` de imagem existia só para
   * miniatura de slot. A cota crescia sozinha, invisível.
   */
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [storage, setStorage] = useState<StorageStatus | null>(null);
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
  const { bindings, rebindKey, resetKeyBindings, attach: attachBindings } =
    useKeyBindings(coreRef, setNotice);
  /** Rebobinando neste instante — a tela precisa mostrar que está. */
  const [rewinding, setRewinding_] = useState(false);
  /** Turbo segurado neste instante — a barra de velocidade mostra isso. */
  const [turboActive, setTurboActive] = useState(false);
  /** Sincronia de áudio/vídeo, contador de FPS e o log do core. */
  const diagnostics = useDiagnostics(coreRef);
  const attachDiagnostics = diagnostics.attach;
  /** Volume de fora do turbo, guardado enquanto o turbo silencia o core. */
  const volumeAntesRef = useRef<number | null>(null);
  /**
   * As preferências de A/V que o turbo pisa e precisa devolver, lidas por ref.
   *
   * São duas: `timestepSync`, que o turbo desliga para o multiplicador ter o
   * que multiplicar, e `audioSync`. `aplicarVelocidade` restaura as duas ao
   * soltar, e os callbacks que a chamam são estáveis (`useCallback` com lista
   * vazia) de propósito — pela ref eles leem sempre o valor atual sem serem
   * remontados.
   */
  const prefsRef = useRef({
    audioSync: diagnostics.av.audioSync,
    timestepSync: diagnostics.av.timestepSync,
  });
  prefsRef.current = {
    audioSync: diagnostics.av.audioSync,
    timestepSync: diagnostics.av.timestepSync,
  };
  /**
   * O callback do core e registrado uma vez na inicializacao; a ref evita
   * recriar aquele efeito so porque o backup mudou de identidade.
   */
  const backupToDiskRef = useRef<
    ((rom: string, opts?: { force?: boolean }) => Promise<boolean>) | null
  >(null);
  /** Mesma razão: a inicialização roda uma vez e precisa da versão atual. */
  const resumeLastRomRef = useRef<((rom: string) => void) | null>(null);
  /** Mesma razao do backup: o callback do core e registrado uma vez so. */
  const refreshTeamRef = useRef<(() => void) | null>(null);
  /**
   * O status corrente para a limpeza ler. O efeito de inicialização tem deps
   * vazias, então o `status` que ele fecharia é o da primeira renderização.
   */
  const statusRef = useRef(status);
  statusRef.current = status;

  /**
   * Miniaturas já lidas, por (ROM, slot), com o mtime que as produziu.
   *
   * Cada `data:` URL sai de `readStateThumbnail` como **string nova**, mesmo
   * quando o arquivo não mudou. Os seis `<img src={info.thumbnail}>` recebiam
   * src diferente a cada passagem e o navegador redecodificava todos — o painel
   * piscava junto. Com a identidade estável, só o slot cujo mtime mudou é
   * relido e recodificado; os outros devolvem a mesma string de antes.
   */
  const thumbCacheRef = useRef(
    new Map<string, { modified?: number; url?: string }>()
  );

  /**
   * Relê do sistema de arquivos do core o que existe guardado.
   *
   * `opts.roms` existe por causa do callback de 30 s: a captura automática muda
   * só o estado automático, mas disparava a releitura inteira — lista de ROMs
   * com um `stat` por arquivo e lista de saves — sem nada ter mudado nelas.
   */
  const refreshLibrary = useCallback((opts: { roms?: boolean } = {}) => {
    const { roms: relerRoms = true } = opts;
    const core = coreRef.current;
    if (!core) return;
    if (relerRoms) {
      try {
        const gamePath = core.filePaths().gamePath;
        setRoms(
          core
            .listRoms()
            .filter(isSupportedRom)
            .map((fileName) => {
              let size: number | undefined;
              try {
                size = (
                  core.FS.stat(`${gamePath}/${fileName}`) as { size?: number }
                ).size;
              } catch {
                // sem stat: a lista continua valendo, só sem o tamanho
              }
              return {
                fileName,
                origin: "upload" as const,
                size,
                ...baseDe(core, fileName),
              };
            })
        );
        // listSaves devolve o diretório cru, com as entradas "." e ".." do FS.
        setSaves(
          core.listSaves().filter((name) => name !== "." && name !== "..")
        );
      } catch {
        // FS ainda nao pronto — a proxima chamada resolve
      }
    }
    // Os slots saem do diretório de estados, e a ROM corrente vem do módulo e
    // não do state: refreshLibrary é chamado de dentro de callbacks que foram
    // criados antes do setStatus, então o status aqui estaria atrasado.
    // A miniatura entra aqui e não em slotsForRom porque ler o FS é efeito —
    // slotsForRom continua sendo só o cruzamento, testável sem core.
    const rom = getLoadedRom() ?? undefined;
    setSlots(
      slotsForRom(readStateEntries(core), rom).map((slot) => {
        if (!slot.exists || !rom) return slot;
        const chave = `${rom}|${slot.slot}`;
        const cache = thumbCacheRef.current.get(chave);
        // Mesmo mtime, mesma imagem: devolve a string de antes, com a mesma
        // identidade, em vez de reler o PNG e recodificar em base64.
        if (cache && cache.modified === slot.modified) {
          return { ...slot, thumbnail: cache.url };
        }
        const url = readStateThumbnail(core, rom, slot.slot);
        thumbCacheRef.current.set(chave, { modified: slot.modified, url });
        return { ...slot, thumbnail: url };
      })
    );
    setAutoState(autoStateInfo(core, rom));
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

  /** Espelho dos saves na pasta `saves/` do projeto (só em dev e preview). */
  const { localSaves, refreshLocalSaves, backupToDisk, restoreFromDisk } =
    useDiskBackup(coreRef, setNotice, refreshLibrary);

  // O callback do core é registrado uma vez; a ref é o que deixa o backup
  // atual chegar até lá sem recriar aquele efeito.
  useEffect(() => {
    backupToDiskRef.current = backupToDisk;
  }, [backupToDisk]);


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
            // O time so muda quando o jogo grava — e o core avisa exatamente
            // aqui, entao nao ha o que sondar em intervalo.
            refreshTeamRef.current?.();
          },
          coreCrashedCallback: () => {
            setStatus({
              kind: "error",
              message: "O core travou. Recarregue a página para tentar de novo.",
            });
          },
          // A cada captura automática (30 s) o painel de estados se atualiza —
          // senão "Continuar de onde parou" só apareceria ao trocar de jogo.
          // Sem reler a biblioteca: a captura não mexe em ROM nem em save.
          autoSaveStateCapturedCallback: () => refreshLibrary({ roms: false }),
        });
        // Bindings explícitos: a legenda da UI lê do mesmo mapa.
        attachBindings(core);
        core.setCoreSettings({
          // Os ajustes do mGBA de mesa entram primeiro; o que vem depois é
          // escolha desta casa e pode sobrepor.
          ...MGBA_CORE_SETTINGS,
          autoSaveStateEnable: true,
          autoSaveStateTimerIntervalSeconds: 30,
          restoreAutoSaveStateOnLoad: false,
          // O buffer de rebobinar já existia no core e nunca era ligado. O
          // mGBA de mesa traz rewind desligado (`rewindEnable=0`); aqui ele
          // fica ligado de propósito, porque a aba oferece o botão.
          ...REWIND_SETTINGS,
        });
        // Sincronia de áudio/vídeo gravada, e o log do core.
        attachDiagnostics(core);
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
          // O try/catch em volta é síncrono e não pega rejeição de promise:
          // sem este catch, sair da aba com a cota cheia virava rejeição não
          // tratada no console. Aqui não há a quem avisar — a tela está indo
          // embora —, então só não deixamos escapar.
          core.FSSync().catch(() => undefined);
        } catch {
          // sem jogo carregado: nada a pausar
        }
      }
    };
    // Ambas são estáveis (useCallback sem dependências), então este efeito
    // continua rodando uma única vez, como a vida do core exige.
  }, [refreshLibrary, attachDiagnostics, attachBindings]);

  /** Sobe uma ROM para o FS do core e inicia o jogo. */
  /**
   * Falha ao carregar uma ROM **nova**.
   *
   * Antes, os tres caminhos de carregamento punham o status em `error` quando a
   * ROM nova falhava — e nenhum deles pausava o jogo que ja estava rodando. O
   * core seguia emulando e tocando audio, o canvas seguia atualizando, e
   * sumiam da tela ao mesmo tempo Pausar, Rebobinar, Capturar, Reiniciar,
   * Fechar jogo, Sincronizar, Tela cheia, Escala, Volume, Velocidade e o
   * gamepad inteiro — porque a PlayPage esconde tudo isso atras de `playing`,
   * que so e verdadeiro nos status `running` e `paused`. O jogo ficava rodando
   * sem nenhum comando.
   *
   * Quem clicou numa ROM invalida nao pediu para interromper o que estava
   * jogando: se havia jogo, ele volta ao status que tinha e o erro vira aviso.
   * So quando nao ha nada rodando o erro toma a tela — senao carregar um
   * arquivo ruim do zero nao mostraria nada.
   */
  const falhaAoCarregar = useCallback(
    (anterior: EmulatorStatus, message: string) => {
      if (anterior.kind === "running" || anterior.kind === "paused") {
        setStatus(anterior);
        setNotice(message);
      } else {
        setStatus({ kind: "error", message });
      }
    },
    []
  );

  const playFile = useCallback(
    async (file: File) => {
      const core = coreRef.current;
      if (!core) return;
      if (!isSupportedRom(file.name)) {
        setNotice(`"${file.name}" não é .gb, .gbc nem .gba.`);
        return;
      }
      // Capturado antes do "loading": e para ca que voltamos se a ROM nova
      // falhar e houver jogo em andamento.
      const anterior = statusRef.current;
      setNotice(null);
      setStatus({ kind: "loading" });

      // O sistema de arquivos do core e plano. Se o nome carregar subpasta
      // ("gb/jogo.gb"), uploadRom tenta escrever em /data/games/gb/, que nao
      // existe — a escrita falha e o callback nunca dispara, deixando a tela
      // em "Carregando..." para sempre. Entao dentro do core usamos o basename.
      const flatName = file.name.replace(/^.*[/\\]/, "");
      const flatFile =
        flatName === file.name ? file : new File([file], flatName);

      // Os 192 primeiros bytes bastam, e o arquivo ja esta em memoria.
      setRomId(
        identifyRom(
          new Uint8Array(await flatFile.slice(0, GBA_HEADER_BYTES).arrayBuffer())
        )
      );

      const uploaded = await withTimeout(
        new Promise<void>((done) => core.uploadRom(flatFile, done)),
        15000
      );
      if (!uploaded) {
        falhaAoCarregar(
          anterior,
          `O core não confirmou a gravação de ${flatName}. Tente de novo.`
        );
        return;
      }
      const erroSync = await syncFs(core);
      if (erroSync) {
        falhaAoCarregar(
          anterior,
          `Não deu para guardar ${flatName} no navegador. ${DICA_DE_COTA}`
        );
        return;
      }

      const ok = core.loadGame(`${core.filePaths().gamePath}/${flatName}`);
      if (!ok) {
        falhaAoCarregar(anterior, `Não deu para carregar ${flatName}.`);
        return;
      }
      // Volume E velocidade: a barra guardava 5x e o jogo novo entrava em 1x.
      core.setVolume(volume / 100);
      aplicarVelocidade(core, false, prefsRef.current, volumeAntesRef);
      rememberLastRom(flatName);
      setLoadedRom(flatName);
      setStatus({ kind: "running", rom: flatName });
      refreshLibrary();
    },
    [refreshLibrary, volume, falhaAoCarregar]
  );

  /** Roda uma ROM que já está guardada no FS do core. */
  const playStored = useCallback(
    (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      const anterior = statusRef.current;
      setNotice(null);
      const ok = core.loadGame(`${core.filePaths().gamePath}/${fileName}`);
      if (ok) setRomId(identifyRom(lerCabecalho(core, fileName)));
      if (!ok) {
        falhaAoCarregar(anterior, `Não deu para carregar ${fileName}.`);
        return;
      }
      // Volume E velocidade: a barra guardava 5x e o jogo novo entrava em 1x.
      core.setVolume(volume / 100);
      aplicarVelocidade(core, false, prefsRef.current, volumeAntesRef);
      rememberLastRom(fileName);
      setLoadedRom(fileName);
      setStatus({ kind: "running", rom: fileName });
      refreshLibrary();
    },
    [refreshLibrary, volume, falhaAoCarregar]
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
      aplicarVelocidade(core, false, prefsRef.current, volumeAntesRef);
      setLoadedRom(fileName);
      setRomId(identifyRom(lerCabecalho(core, fileName)));

      const erroSync = await syncFs(core);
      if (erroSync) {
        setStatus({
          kind: "error",
          message: `${fileName} carregou, mas não deu para gravar no navegador. ${DICA_DE_COTA}`,
        });
        return;
      }
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
    [refreshLibrary, volume]
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
      // Quem poe "loading" e o playFile: se fosse aqui, o status do jogo em
      // andamento ja estaria perdido quando ele captura o anterior.
      const anterior = statusRef.current;
      setNotice(null);
      try {
        const res = await fetch(`/local-roms/${encodeURIComponent(fileName)}`);
        if (!res.ok) throw new Error(`servidor respondeu ${res.status}`);
        const buffer = await res.arrayBuffer();
        await playFile(new File([buffer], fileName));
      } catch (error) {
        falhaAoCarregar(
          anterior,
          `Não deu para ler ${fileName} da pasta roms/ (${
            error instanceof Error ? error.message : String(error)
          }).`
        );
      }
    },
    [playFile, falhaAoCarregar]
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
    // Reiniciar relê a flash: o time pode ter mudado se o save veio de fora.
    refreshTeamRef.current?.();
    setNotice("Jogo reiniciado.");
  }, []);

  const stop = useCallback(() => {
    const core = coreRef.current;
    if (!core) return;
    core.quitGame();
    core.FSSync().catch(() => undefined);
    setLoadedRom(null);
    setRomId(null);
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
      const erroSync = await syncFs(core);
      refreshLibrary();
      if (!ok) setNotice(`Falhou ao gravar o slot ${slot}.`);
      else if (erroSync)
        setNotice(
          `Slot ${slot} gravado, mas não foi para o armazenamento — pode se perder ao recarregar. ${DICA_DE_COTA}`
        );
      else setNotice(`Estado gravado no slot ${slot}.`);
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
      let erroSync: string | null = null;
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
        erroSync = await syncFs(core);
      }
      refreshLibrary();
      if (!removed) setNotice(`Slot ${slot} já estava vazio.`);
      else if (erroSync)
        setNotice(
          `Slot ${slot} apagado, mas o armazenamento não confirmou — ele pode reaparecer ao recarregar. ${DICA_DE_COTA}`
        );
      else setNotice(`Slot ${slot} apagado.`);
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
    const erroSync = await syncFs(core);
    refreshLibrary();
    if (!ok) setNotice("Não deu para capturar.");
    else if (erroSync)
      setNotice(`Ponto capturado, mas não foi para o armazenamento. ${DICA_DE_COTA}`);
    else setNotice("Ponto automático capturado.");
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
      const erroSync = await syncFs(core);
      refreshLibrary();
      setNotice(
        erroSync
          ? `"${file.name}" entrou, mas não foi gravado no navegador — some ao recarregar. ${DICA_DE_COTA}`
          : `"${file.name}" importado. Recarregue o jogo para o save valer.`
      );
    },
    [refreshLibrary]
  );

  const setVolume = useCallback((percent: number) => {
    setVolumeState(percent);
    rememberVolume(percent);
    coreRef.current?.setVolume(percent / 100);
  }, []);

  /**
   * Turbo momentâneo, enquanto a tecla estiver segurada.
   *
   * É o modelo do mGBA de mesa, e o único que ele oferece: velocidade normal,
   * ou segurar a tecla para acelerar sem teto. Não há régua de velocidade lá,
   * e não há mais aqui — a que existia mentia, porque o core não honra o
   * multiplicador (medido: pedir 5× e pedir metade dão 1× igual).
   *
   * Estável de propósito: a PlayPage tem este `setTurbo` nas dependências do
   * efeito de atalhos E o chama na limpeza. Com identidade variável, o React
   * rodava a limpeza antiga e desligava o turbo logo depois de ligá-lo.
   */
  const setTurbo = useCallback((active: boolean) => {
    aplicarVelocidade(coreRef.current, active, prefsRef.current, volumeAntesRef);
    setTurboActive(active);
  }, []);

  /**
   * Relê a pasta de capturas do jogo atual.
   *
   * Só do jogo atual: as capturas levam o nome-base da ROM, e mostrar as de
   * outro jogo seria ruído no painel de quem está jogando este.
   */
  const refreshScreenshots = useCallback(() => {
    const core = coreRef.current;
    const rom = getLoadedRom();
    if (!core || !rom) {
      setScreenshots([]);
      return;
    }
    const dir = core.filePaths().screenshotsPath;
    const base = romBaseName(rom);
    let nomes: string[];
    try {
      nomes = core.FS.readdir(dir);
    } catch {
      setScreenshots([]);
      return;
    }
    const lista: Screenshot[] = [];
    for (const nome of nomes) {
      // As miniaturas de slot moram no mesmo diretório; `parseScreenshotName`
      // devolve null para elas.
      const lido = parseScreenshotName(nome);
      if (!lido || lido.base !== base) continue;
      let size: number | undefined;
      try {
        size = (core.FS.stat(`${dir}/${nome}`) as { size?: number }).size;
      } catch {
        // sem stat: a entrada continua valendo, só sem o tamanho
      }
      lista.push({ fileName: nome, when: lido.when, size });
    }
    lista.sort((a, b) => b.when.getTime() - a.when.getTime());
    setScreenshots(lista);
  }, []);

  /** Lê uma captura como `data:` URL. Sob demanda, nunca em lote. */
  const readScreenshot = useCallback((fileName: string): string | undefined => {
    const core = coreRef.current;
    if (!core) return undefined;
    try {
      const data = core.FS.readFile(
        `${core.filePaths().screenshotsPath}/${fileName}`
      ) as Uint8Array;
      return data.length > 0 ? toDataUrl(data) : undefined;
    } catch {
      return undefined;
    }
  }, []);

  /** Baixa de novo uma captura que já está guardada. */
  const downloadScreenshot = useCallback((fileName: string) => {
    const core = coreRef.current;
    if (!core) return;
    try {
      const data = core.FS.readFile(
        `${core.filePaths().screenshotsPath}/${fileName}`
      ) as Uint8Array;
      // Mesmo motivo do exportSave: o buffer pode ser SharedArrayBuffer, que o
      // Blob não aceita.
      const copy = new Uint8Array(data.length);
      copy.set(data);
      const url = URL.createObjectURL(new Blob([copy], { type: "image/png" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setNotice(
        `Não deu para ler ${fileName}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, []);

  /** Apaga uma captura. É o caminho que faltava para a cota parar de crescer. */
  const deleteScreenshot = useCallback(
    async (fileName: string) => {
      const core = coreRef.current;
      if (!core) return;
      try {
        core.FS.unlink(`${core.filePaths().screenshotsPath}/${fileName}`);
      } catch (error) {
        setNotice(
          `Não deu para apagar ${fileName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return;
      }
      const erroSync = await syncFs(core);
      refreshScreenshots();
      setNotice(
        erroSync
          ? `${fileName} apagado, mas o armazenamento não confirmou. ${DICA_DE_COTA}`
          : `${fileName} apagado.`
      );
    },
    [refreshScreenshots]
  );

  /**
   * O time do jogador, lido do save de bateria.
   *
   * `null` enquanto não há jogo, e `[]` quando há save mas nenhum pokémon — os
   * dois casos são diferentes na tela. Romhack e jogo que não seja de Gen 3
   * simplesmente não abrem: o painel diz isso em uma frase, e nunca fica num
   * carregando eterno.
   */
  const [team, setTeam] = useState<Gen3PartyMember[] | null>(null);
  const [teamLido, setTeamLido] = useState(false);

  const refreshTeam = useCallback(() => {
    const core = coreRef.current;
    const rom = getLoadedRom();
    if (!core || !rom) {
      setTeam(null);
      setTeamLido(false);
      return;
    }
    let bytes: Uint8Array | null = null;
    try {
      bytes = core.getSave();
    } catch {
      bytes = null;
    }
    const save = bytes ? parseGen3Save(bytes) : null;
    setTeam(save?.party ?? null);
    setTeamLido(true);
    // A mesma leitura alimenta a Pokédex da Home e a página do treinador,
    // que não carregam o core.
    if (save?.pokedex) recordPlayerDex(rom, save.playerName, save.pokedex);
    if (save) recordTrainerSave(rom, save);
  }, []);

  // O callback do core é registrado uma vez; a ref leva a versão atual até lá.
  useEffect(() => {
    refreshTeamRef.current = refreshTeam;
  }, [refreshTeam]);

  /**
   * Trazer um save de fora muda o time sem o jogo ter gravado nada — então o
   * `saveDataUpdatedCallback`, que é o gatilho normal, não dispara. Aqui a
   * releitura é explícita.
   */
  const restoreFromDiskERelerTime = useCallback(
    async (fileName: string) => {
      await restoreFromDisk(fileName);
      refreshTeam();
    },
    [restoreFromDisk, refreshTeam]
  );

  /**
   * A galeria acompanha o jogo carregado.
   *
   * Depende do nome da ROM e não do objeto `status`: pausar e retomar trocam a
   * identidade do status sem trocar de jogo, e reler a pasta a cada pausa seria
   * trabalho à toa.
   */
  const romCarregada =
    status.kind === "running" || status.kind === "paused"
      ? status.rom
      : undefined;
  useEffect(() => {
    if (romCarregada) {
      refreshScreenshots();
      refreshTeam();
    } else {
      setScreenshots([]);
      setTeam(null);
      setTeamLido(false);
    }
  }, [romCarregada, refreshScreenshots, refreshTeam]);

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
      const erroSync = await syncFs(core);
      if (erroSync) {
        setNotice(`A captura não foi gravada no navegador. ${DICA_DE_COTA}`);
        return;
      }
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
        // A captura continua no FS depois do download: a galeria precisa saber.
        refreshScreenshots();
        setNotice(`${fileName} salvo (${formatBytes(copy.length)}).`);
      } catch (error) {
        setNotice(
          `A captura foi feita mas não deu para ler de volta: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    [refreshScreenshots]
  );

  /**
   * Liga/desliga a entrada no core. Usado enquanto a tela espera uma tecla
   * nova: sem isso, a tecla escolhida também iria para o jogo.
   */
  const setInputEnabled = useCallback((enabled: boolean) => {
    coreRef.current?.toggleInput(enabled);
  }, []);

  /**
   * Avisos somem sozinhos.
   *
   * Eram confirmações de ação — "estado gravado", "save copiado" — que ficavam
   * na tela até alguém clicar no ✕, e iam se acumulando na memória de quem
   * joga como se algo estivesse pendente. O ✕ continua, para quem quiser tirar
   * antes. Falhas de verdade não passam por aqui: `status.kind === "error"` tem
   * painel próprio, que não expira.
   */
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /** Grava o save pendente — útil antes de fechar a aba. */
  const sync = useCallback(async () => {
    const erroSync = await syncFs(coreRef.current ?? undefined);
    setNotice(
      erroSync
        ? `Não deu para sincronizar o progresso. ${DICA_DE_COTA}`
        : "Progresso sincronizado."
    );
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
    romId,
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
    av: diagnostics.av,
    setAv: diagnostics.setAv,
    log: diagnostics.log,
    clearLog: diagnostics.clearLog,
    setTurbo,
    setRewinding,
    takeScreenshot,
    team,
    teamLido,
    screenshots,
    refreshScreenshots,
    readScreenshot,
    downloadScreenshot,
    deleteScreenshot,
    storage,
    localSaves,
    refreshLocalRoms,
    backupToDisk,
    restoreFromDisk: restoreFromDiskERelerTime,
  };
}
