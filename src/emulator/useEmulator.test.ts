// @vitest-environment jsdom
/**
 * Primeiro teste de hook do emulador.
 *
 * Os 136 testes que existiam antes deste cobriam so funcao pura: o modulo
 * inteiro com estado e ciclo de vida estava descoberto, e e exatamente onde
 * os bugs moravam.
 *
 * O core e dublado por um Proxy que absorve qualquer metodo desconhecido e so
 * registra `setFastForwardMultiplier`. Assim o teste nao precisa acompanhar a
 * superficie inteira da mGBA-wasm para continuar valendo.
 */
import { createElement } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";

const dublê = vi.hoisted(() => ({
  multiplicadores: [] as number[],
  /**
   * Chamadas de `setMainLoopTiming`.
   *
   * Este build é pthreads e a emulação roda numa worker, então mexer no laço da
   * thread principal não acelera nada — a lista existe para provar que ficou
   * **vazia**, não para conferir valores.
   */
  timings: [] as { mode: number; value: number }[],
  /** Objetos passados a `setCoreSettings`, na ordem. */
  coreSettings: [] as Record<string, unknown>[],
  /**
   * Nomes dos métodos chamados, na ordem.
   *
   * O turbo aplica o multiplicador e silencia, e nada mais; esta lista existe
   * para provar que nenhum ajuste do core é tocado durante a aceleração.
   */
  chamadas: [] as string[],
  /** Volume corrente do core, para o mudo do turbo. */
  volume: 80,
  /** Valores passados a `setVolume`, na ordem. */
  volumes: [] as number[],
  /** Liga a rejeição de `FSSync`, que é como a cota cheia se manifesta. */
  syncFalha: false,
  /** Faz `loadGame` recusar, como acontece com ROM corrompida. */
  loadFalha: false,
}));
const multiplicadores = dublê.multiplicadores;

vi.mock("./core", () => {
  const registrado: Record<string, unknown> = {
    setFastForwardMultiplier: (n: number) => {
      dublê.chamadas.push("setFastForwardMultiplier");
      dublê.multiplicadores.push(n);
    },
    setMainLoopTiming: (mode: number, value: number) => {
      dublê.chamadas.push("setMainLoopTiming");
      dublê.timings.push({ mode, value });
    },
    setCoreSettings: (s: Record<string, unknown>) => {
      dublê.chamadas.push("setCoreSettings");
      dublê.coreSettings.push(s);
    },
    getVolume: () => dublê.volume,
    setVolume: (v: number) => {
      dublê.chamadas.push("setVolume");
      dublê.volumes.push(v);
      dublê.volume = v;
    },
    // A mensagem é a do core de verdade, conferida em public/emulator/mgba.js.
    FSSync: () =>
      dublê.syncFalha
        ? Promise.reject(
            new Error("Error syncing app data to IndexedDB: QuotaExceededError")
          )
        : Promise.resolve(),
    uploadRom: (_arquivo: unknown, pronto: () => void) => pronto(),
    loadGame: () => !dublê.loadFalha,
    filePaths: () => ({ gamePath: "/data/games", screenshotsPath: "/data/shots" }),
    saveStateSlot: () => true,
  };
  const core = new Proxy(registrado, {
    get: (alvo, prop) => {
      if (prop in alvo) return alvo[prop as string];
      // `then` NÃO pode virar função: `Promise.resolve(core)` inspeciona essa
      // propriedade e, se ela for chamável, trata o dublê como thenable — passa
      // a esperar que ele mesmo chame `resolve`, o que um no-op nunca faz, e a
      // promise nunca assenta. Símbolos ficam de fora pela mesma razão
      // (Symbol.toPrimitive, Symbol.iterator).
      if (prop === "then" || typeof prop === "symbol") return undefined;
      return () => undefined;
    },
  });
  return {
    CORE_URL: "/emulator/mgba.js",
    READY_EVENT: "mgba-core-loaded",
    checkIsolation: () => ({
      ok: true,
      crossOriginIsolated: true,
      sharedArrayBuffer: true,
      webAssembly: true,
    }),
    coreVersion: () => "stub",
    getCanvas: () => document.createElement("canvas"),
    getCore: () => Promise.resolve(core),
    getLoadedRom: () => null,
    setLoadedRom: () => undefined,
    getWasRunning: () => false,
    setWasRunning: () => undefined,
  };
});

vi.mock("./storage", async (original) => ({
  ...(await original<Record<string, unknown>>()),
  requestPersistence: async () => ({ persistent: false, supported: false }),
  listLocalSaves: async () => null,
}));

vi.mock("./saveStates", async (original) => ({
  ...(await original<Record<string, unknown>>()),
  readStateEntries: () => [],
}));

import { useEmulator } from "./useEmulator";
import { TURBO_MULTIPLIER } from "./shortcuts";

/**
 * Monta o hook e espera o core dublê ser adotado.
 *
 * `renderHook` sozinho não serve: a inicialização do core só roda quando
 * `stageRef` já está preso a um elemento (`useEmulator.ts:249`), e sem DOM ela
 * retorna cedo. Daí a sonda — um componente mínimo que só existe para pendurar
 * o ref e expor o retorno do hook.
 */
async function montar() {
  const visto: { atual: ReturnType<typeof useEmulator> | null } = { atual: null };
  function Sonda() {
    const emu = useEmulator();
    visto.atual = emu;
    return createElement("div", { ref: emu.stageRef });
  }
  render(createElement(Sonda));
  await waitFor(() => expect(visto.atual?.version).toBe("stub"));
  return visto as { atual: ReturnType<typeof useEmulator> };
}

beforeEach(() => {
  multiplicadores.length = 0;
  dublê.timings.length = 0;
  dublê.coreSettings.length = 0;
  dublê.chamadas.length = 0;
  dublê.syncFalha = false;
  dublê.loadFalha = false;
  window.localStorage.clear();
});

/**
 * `FSSync()` rejeita quando `FS.syncfs` devolve erro — o caso comum é a cota do
 * navegador cheia. A definição está em `public/emulator/mgba.js`:
 * `FSSync=()=>new Promise((resolve,reject)=>{FS.syncfs(err=>{if(err){reject(...)}resolve()})})`.
 *
 * Sem guarda, a rejeição virava unhandled rejection silenciosa: quem chama faz
 * `void emu.playFile(file)`, então a tela ficava em "Carregando…" para sempre e
 * a única saída era recarregar a página.
 */
describe("useEmulator — falha ao sincronizar com o IndexedDB", () => {
  it("carregar ROM vira erro com saída, e não “Carregando…” eterno", async () => {
    const emu = await montar();
    dublê.syncFalha = true;

    await act(async () => {
      await emu.atual.playFile(new File([new Uint8Array(8)], "teste.gba"));
    });

    expect(emu.atual.status.kind).not.toBe("loading");
    expect(emu.atual.status.kind).toBe("error");
    const msg = emu.atual.status.kind === "error" ? emu.atual.status.message : "";
    expect(msg.toLowerCase()).toContain("cota");
  });

  /** Gravar é recuperável: avisa sem derrubar o jogo que está rodando. */
  it("gravar estado avisa que não persistiu, sem derrubar o jogo", async () => {
    const emu = await montar();
    dublê.syncFalha = true;

    await act(async () => {
      await emu.atual.saveState(1);
    });

    expect(emu.atual.notice).toBeTruthy();
    expect(String(emu.atual.notice).toLowerCase()).toContain("cota");
    expect(emu.atual.status.kind).not.toBe("error");
  });

  it("o botão de sincronizar não mente quando a gravação falha", async () => {
    const emu = await montar();
    dublê.syncFalha = true;

    await act(async () => {
      await emu.atual.sync();
    });

    expect(String(emu.atual.notice)).not.toContain("Progresso sincronizado");
  });
});

/**
 * Falhar ao carregar uma ROM **nova** não pode derrubar o jogo em andamento.
 *
 * Os três caminhos punham o status em `error` — e nenhum deles pausava o core.
 * O jogo seguia emulando e tocando áudio, mas a PlayPage esconde Pausar,
 * Rebobinar, Capturar, Reiniciar, Fechar, Sincronizar, Tela cheia, Escala,
 * Volume, Velocidade e o gamepad inteiro atrás de `playing`, que só é
 * verdadeiro em `running` e `paused`. O jogo ficava rodando sem comando algum.
 */
describe("useEmulator — ROM nova que falha", () => {
  async function comJogoRodando() {
    const emu = await montar();
    await act(async () => {
      await emu.atual.playFile(new File([new Uint8Array(8)], "bom.gba"));
    });
    expect(emu.atual.status).toEqual({ kind: "running", rom: "bom.gba" });
    return emu;
  }

  it("mantém o jogo em andamento e avisa, em vez de trocar o status", async () => {
    const emu = await comJogoRodando();
    dublê.loadFalha = true;

    await act(async () => {
      await emu.atual.playFile(new File([new Uint8Array(8)], "ruim.gba"));
    });

    expect(emu.atual.status).toEqual({ kind: "running", rom: "bom.gba" });
    expect(String(emu.atual.notice)).toContain("ruim.gba");
  });

  it("vale também para a ROM já guardada na biblioteca", async () => {
    const emu = await comJogoRodando();
    dublê.loadFalha = true;

    await act(async () => {
      emu.atual.playStored("outra.gba");
    });

    expect(emu.atual.status).toEqual({ kind: "running", rom: "bom.gba" });
    expect(String(emu.atual.notice)).toContain("outra.gba");
  });

  /** Sem jogo em andamento, o erro precisa tomar a tela — senão não aparece. */
  it("sem jogo rodando, a falha continua virando status de erro", async () => {
    const emu = await montar();
    dublê.loadFalha = true;

    await act(async () => {
      await emu.atual.playFile(new File([new Uint8Array(8)], "ruim.gba"));
    });

    expect(emu.atual.status.kind).toBe("error");
  });
});

/**
 * A velocidade: `setFastForwardMultiplier` e nada mais.
 *
 * Isso só passou a valer com o core preso em 2.5.0 — a 2.5.1 quebrou o
 * multiplicador, e é por isso que `package.json` fixa a versão sem `^`. Medido
 * contando quadros emulados (`keysReadCallback`): na 2.5.0, `-5` leva o jogo de
 * 66 para 29 qps e `5` o leva a 104; na 2.5.1 o número não sai de 60 em
 * nenhum dos casos. A tabela completa está na doc de `aplicarVelocidade`.
 *
 * O que estes testes travam é que nada mais seja tocado ao acelerar. Três
 * tentativas anteriores mexeram em `timestepSync` e `setMainLoopTiming` para
 * compensar o multiplicador morto; a primeira deixava o jogo mais pesado e a
 * segunda causava arrancadas aleatórias em velocidade normal.
 */
describe("useEmulator — turbo", () => {
  it("segurar aplica o multiplicador e silencia", async () => {
    const emu = await montar();
    dublê.chamadas.length = 0;
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    expect(multiplicadores.at(-1)).toBe(TURBO_MULTIPLIER);
    expect(dublê.volumes.at(-1)).toBe(0);
  });

  /**
   * O passo fixo é preferência de quem joga, não alavanca de velocidade.
   * Desligá-lo no turbo não acelerava e fazia o core mirar 300 quadros por
   * segundo e falhar — era a sensação de "mais pesado e não acelera".
   */
  it("não mexe nos ajustes do core enquanto acelera", async () => {
    const emu = await montar();
    dublê.chamadas.length = 0;
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    expect(dublê.chamadas).not.toContain("setCoreSettings");
  });

  /** O laço da thread principal só desenha; a emulação não escuta. */
  it("nunca dirige o laço principal", async () => {
    const emu = await montar();
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    await act(async () => {
      emu.atual.setTurbo(false);
    });
    expect(dublê.timings).toEqual([]);
  });

  it("soltar devolve a velocidade normal", async () => {
    const emu = await montar();
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    await act(async () => {
      emu.atual.setTurbo(false);
    });
    expect(multiplicadores.at(-1)).toBe(1);
  });

  /**
   * Em 1× ninguém disputa o byte, então é aqui — e só aqui — que a preferência
   * da tela de A/V volta a valer.
   */
  it("reafirma o audioSync ao sair do turbo, não ao entrar", async () => {
    const emu = await montar();
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    dublê.chamadas.length = 0;
    await act(async () => {
      emu.atual.setTurbo(false);
    });
    const mult = dublê.chamadas.indexOf("setFastForwardMultiplier");
    const sync = dublê.chamadas.lastIndexOf("setCoreSettings");
    expect(mult).toBeGreaterThanOrEqual(0);
    expect(sync).toBeGreaterThan(mult);
  });

  it("silencia enquanto acelera e devolve o volume ao soltar", async () => {
    const emu = await montar();
    dublê.volume = 70;
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    expect(dublê.volumes.at(-1)).toBe(0);
    await act(async () => {
      emu.atual.setTurbo(false);
    });
    expect(dublê.volumes.at(-1)).toBe(70);
  });

  /** A régua saiu: o hook não expõe mais nada para ajustá-la. */
  it("não existe mais controle de velocidade no hook", async () => {
    const emu = await montar();
    expect("setFastForward" in emu.atual).toBe(false);
    expect("fastForward" in emu.atual).toBe(false);
  });
});
