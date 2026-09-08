import type { mGBAEmulator } from "./types";

/**
 * Carregamento e inicializacao do core mGBA.
 *
 * O core vive em `public/emulator/` e precisa ficar la: o runtime de threads do
 * Emscripten sobe o worker de pthread a partir da URL do proprio script e
 * resolve `mgba.wasm` relativo a ela. Se o bundler reescrever o modulo, as
 * duas coisas quebram.
 *
 * Mas arquivo em `public/` NAO pode ser alvo de `import()` no codigo-fonte: em
 * dev o Vite anexa `?import` a URL, tenta transformar, ve que o caminho esta
 * em publicDir e responde 500 —
 *
 *   "This file is in /public and will be copied as-is during build without
 *    going through the plugin transforms, and therefore should not be imported
 *    from source code. It can only be referenced via HTML tags."
 *
 * (`/* @vite-ignore *\/` nao evita isso: ele dispensa a analise do especificador,
 * nao o marcador `?import` do pipeline de dev.)
 *
 * Entao carregamos exatamente como o Vite manda: injetando uma tag <script>.
 * O `import()` de dentro dela e executado pelo browser, nao pelo Vite, e a URL
 * chega limpa. Funciona igual em dev e em producao.
 */

export const CORE_URL = "/emulator/mgba.js";
export const READY_EVENT = "mgba-core-loaded";
const LOAD_TIMEOUT_MS = 30_000;

type CoreFactory = (options: {
  canvas: HTMLCanvasElement;
}) => Promise<mGBAEmulator>;

declare global {
  interface Window {
    __mgbaCoreFactory__?: CoreFactory;
    __mgbaCoreError__?: string;
  }
}

export interface IsolationCheck {
  ok: boolean;
  crossOriginIsolated: boolean;
  sharedArrayBuffer: boolean;
  webAssembly: boolean;
}

/**
 * O core precisa de SharedArrayBuffer, que o navegador so concede a paginas
 * cross-origin isolated. Checar antes evita um erro cru do Emscripten e
 * permite explicar ao usuario o que esta faltando.
 */
export function checkIsolation(): IsolationCheck {
  const isolated =
    typeof globalThis.crossOriginIsolated === "boolean"
      ? globalThis.crossOriginIsolated
      : false;
  const sab = typeof SharedArrayBuffer !== "undefined";
  const wasm = typeof WebAssembly !== "undefined";
  return {
    ok: isolated && sab && wasm,
    crossOriginIsolated: isolated,
    sharedArrayBuffer: sab,
    webAssembly: wasm,
  };
}

/**
 * Monta o texto do carregador injetado.
 *
 * Extraido para poder ser testado: o `import()` precisa ficar DENTRO desta
 * string, nunca como expressao no fonte — se voltar para o fonte, o Vite anexa
 * `?import` e o dev quebra com 500.
 */
export function buildLoaderScript(
  coreUrl: string,
  readyEvent: string
): string {
  return [
    `import(${JSON.stringify(coreUrl)})`,
    `  .then(function (m) { window.__mgbaCoreFactory__ = m.default || m; })`,
    `  .catch(function (e) { window.__mgbaCoreError__ = (e && e.message) || String(e); })`,
    `  .finally(function () { window.dispatchEvent(new Event(${JSON.stringify(
      readyEvent
    )})); });`,
  ].join("\n");
}

let factoryPromise: Promise<CoreFactory> | null = null;

/** Importa a fabrica do core uma unica vez por sessao, via tag <script>. */
function loadFactory(): Promise<CoreFactory> {
  if (factoryPromise) return factoryPromise;

  factoryPromise = new Promise<CoreFactory>((resolve, reject) => {
    // Se outra montagem ja carregou (StrictMode remonta em dev), reaproveita.
    if (window.__mgbaCoreFactory__) {
      resolve(window.__mgbaCoreFactory__);
      return;
    }

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.removeEventListener(READY_EVENT, onReady);
      window.clearTimeout(timer);
      fn();
    };

    const onReady = () => {
      const factory = window.__mgbaCoreFactory__;
      if (typeof factory === "function") {
        finish(() => resolve(factory));
        return;
      }
      const detail = window.__mgbaCoreError__ ?? "motivo não informado";
      finish(() =>
        reject(
          new Error(
            `O core do emulador não carregou de ${CORE_URL}: ${detail}. ` +
              "Se o arquivo não existe, rode `npm run emulator:core`."
          )
        )
      );
    };

    const timer = window.setTimeout(() => {
      finish(() =>
        reject(
          new Error(
            `O core do emulador não respondeu em ${
              LOAD_TIMEOUT_MS / 1000
            }s (${CORE_URL}).`
          )
        )
      );
    }, LOAD_TIMEOUT_MS);

    window.addEventListener(READY_EVENT, onReady);

    // O import roda no browser; o Vite nao ve o conteudo desta string.
    const script = document.createElement("script");
    script.dataset.mgbaLoader = "true";
    script.textContent = [
      `import(${JSON.stringify(CORE_URL)})`,
      `  .then(function (m) { window.__mgbaCoreFactory__ = m.default || m; })`,
      `  .catch(function (e) { window.__mgbaCoreError__ = (e && e.message) || String(e); })`,
      `  .finally(function () { window.dispatchEvent(new Event(${JSON.stringify(
        READY_EVENT
      )})); });`,
    ].join("\n");
    script.onerror = () =>
      finish(() =>
        reject(new Error(`Não foi possível injetar o carregador do core.`))
      );

    document.head.appendChild(script);
  }).catch((error: unknown) => {
    // Zera para uma proxima tentativa poder recarregar.
    factoryPromise = null;
    throw error instanceof Error ? error : new Error(String(error));
  });

  return factoryPromise;
}

/**
 * Canvas do emulador — criado UMA vez e reaproveitado pela sessao.
 *
 * O core e amarrado ao canvas na criacao e a doc dele e explicita: "designed to
 * be created once, retained by the host application". Se o React desmontar e
 * remontar a pagina (StrictMode em dev faz isso no primeiro mount, e navegar
 * para fora e voltar faz sempre), um canvas novo deixaria o core preso no
 * antigo — tela preta — ou obrigaria a instanciar um segundo runtime.
 *
 * Entao o canvas vive aqui, fora da arvore do React, e a pagina so o adota
 * (appendChild) no container dela.
 */
let persistentCanvas: HTMLCanvasElement | null = null;

export function getCanvas(): HTMLCanvasElement {
  if (!persistentCanvas) {
    persistentCanvas = document.createElement("canvas");
    persistentCanvas.className = "play-canvas";
    persistentCanvas.width = 240;
    persistentCanvas.height = 160;
  }
  return persistentCanvas;
}

let corePromise: Promise<mGBAEmulator> | null = null;

/**
 * Devolve o core da sessao, criando-o na primeira chamada. Chamadas seguintes
 * reaproveitam a mesma instancia — sem isso o StrictMode instanciava dois
 * runtimes (dois downloads de wasm e dois `exit(0)`) sobre o mesmo canvas.
 *
 * `FSInit` monta IDBFS — e por isso que saves de bateria, save states e as
 * proprias ROMs enviadas sobrevivem a recarregar a pagina.
 */
export function getCore(): Promise<mGBAEmulator> {
  if (!corePromise) {
    corePromise = loadFactory()
      .then(async (factory) => {
        const core = await factory({ canvas: getCanvas() });
        await core.FSInit();
        return core;
      })
      .catch((error: unknown) => {
        corePromise = null;
        throw error instanceof Error ? error : new Error(String(error));
      });
  }
  return corePromise;
}

/**
 * ROM carregada no core, se houver.
 *
 * Precisa viver aqui e nao em estado do React: o core sobrevive a desmontagem
 * da pagina, entao ao voltar para /jogar o React comecaria do zero e a UI
 * mostraria "nenhum jogo carregado" em cima de um jogo que continua na
 * memoria.
 */
let loadedRom: string | null = null;

export function getLoadedRom(): string | null {
  return loadedRom;
}

export function setLoadedRom(name: string | null): void {
  loadedRom = name;
}

/** Versao do core, para exibir na UI. */
export function coreVersion(core: mGBAEmulator): string {
  const { projectName, projectVersion } = core.version;
  return `${projectName} ${projectVersion}`;
}
