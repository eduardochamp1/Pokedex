import type { mGBAEmulator } from "./types";

/**
 * Carregamento e inicializacao do core mGBA.
 *
 * ### Isto segue o gbajs3, e a diferenca importa
 *
 * O core vem do pacote, por `import` normal — e o que o `use-emulator.tsx` do
 * gbajs3 faz, e ele roda este mesmo core em producao. O que torna isso possivel
 * e uma linha na `vite.config.ts`:
 *
 *     optimizeDeps: { exclude: ["@thenick775/mgba-wasm"] }
 *
 * O `mgba.js` e glue do Emscripten: ele sobe o worker de pthread a partir da
 * URL do proprio script e resolve o `.wasm` relativo a ela. Sem o `exclude`, o
 * pre-bundle do esbuild reescreve o modulo e o move, e as duas resolucoes
 * quebram.
 *
 * ### O que havia aqui antes
 *
 * Uma versao anterior nao conhecia o `exclude` e contornou o problema copiando
 * `mgba.js` e `mgba.wasm` para `public/emulator/` num plugin de build, e
 * carregando dali por uma tag `<script>` injetada com `import()` dentro de uma
 * string — porque arquivo em `public/` nao pode ser alvo de `import()` no
 * fonte (o Vite anexa `?import` e responde 500).
 *
 * Funcionava, mas era um caminho so nosso, com uma copia de 2 MB versionada e
 * um carregador de 80 linhas para manter. Sair dele foi o pedido: seguir o
 * projeto que ja funciona em vez de manter um desvio proprio.
 */

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
    // O canvas e criado fora do React, entao o rotulo tem que vir daqui: sem
    // ele um leitor de tela anuncia so "canvas", sem dizer o que e aquilo.
    persistentCanvas.setAttribute("role", "img");
    persistentCanvas.setAttribute("aria-label", "Tela do emulador");
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
    corePromise = (async () => {
      // A mesma sequência do `use-emulator.tsx` do gbajs3, `import()`
      // dinâmico incluído: o core são ~2 MB entre glue e wasm, e quem abre a
      // Pokédex para ver um Pokémon não tem por que baixá-los. Com o import
      // estático ele ia para o chunk principal e pesava em toda a navegação.
      const { default: mGBA } = await import("@thenick775/mgba-wasm");
      const core = (await mGBA({ canvas: getCanvas() })) as mGBAEmulator;
      await core.FSInit();
      // Só em dev: o core vive fora da árvore do React e não há como
      // alcançá-lo pelo console para inspecionar o FS virtual ou testar uma
      // chamada. O build de produção não leva isto.
      if (import.meta.env.DEV) {
        (window as unknown as Record<string, unknown>).__mgbaCore__ = core;
      }
      return core;
    })().catch((error: unknown) => {
      // Zera para uma próxima tentativa poder recarregar.
      corePromise = null;
      throw error instanceof Error ? error : new Error(String(error));
    });
  }
  return corePromise;
}

/**
 * Liga ou desliga o teclado do jogo, **se** já existe um core com jogo.
 *
 * Para sobreposições como a busca (Ctrl+K): o core recebe as teclas pelo SDL
 * do Emscripten, que não sabe de campo de texto nenhum — digitar "mudkip" na
 * busca andaria com o personagem, e o Enter apertaria Start. Nunca cria o
 * core: abrir a busca na Home não pode baixar 2 MB de emulador.
 */
export function setGameKeyboard(enabled: boolean): void {
  if (!corePromise || !loadedRom) return;
  corePromise.then((core) => core.toggleInput(enabled)).catch(() => {
    // sem core não há teclado a ligar
  });
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

/**
 * O jogo estava rodando quando a pagina foi desmontada?
 *
 * Sair de /jogar pausa — nao vale queimar CPU e tocar audio numa aba que
 * ninguem esta vendo. Mas voltar e ter que clicar em "Continuar" e atrito: se
 * estava rodando ao sair, tem que voltar rodando. Vive aqui pelo mesmo motivo
 * que `loadedRom`: o estado do React morre na desmontagem, o core nao.
 */
let wasRunning = false;

export function getWasRunning(): boolean {
  return wasRunning;
}

export function setWasRunning(running: boolean): void {
  wasRunning = running;
}

/** Versao do core, para exibir na UI. */
export function coreVersion(core: mGBAEmulator): string {
  const { projectName, projectVersion } = core.version;
  return `${projectName} ${projectVersion}`;
}
