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
  /** Liga a rejeição de `FSSync`, que é como a cota cheia se manifesta. */
  syncFalha: false,
}));
const multiplicadores = dublê.multiplicadores;

vi.mock("./core", () => {
  const registrado: Record<string, unknown> = {
    setFastForwardMultiplier: (n: number) => {
      dublê.multiplicadores.push(n);
    },
    // A mensagem é a do core de verdade, conferida em public/emulator/mgba.js.
    FSSync: () =>
      dublê.syncFalha
        ? Promise.reject(
            new Error("Error syncing app data to IndexedDB: QuotaExceededError")
          )
        : Promise.resolve(),
    uploadRom: (_arquivo: unknown, pronto: () => void) => pronto(),
    loadGame: () => true,
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
  dublê.syncFalha = false;
  window.localStorage.clear();
});

describe("useEmulator — barra de velocidade", () => {
  it("manda o multiplicador novo para o core", async () => {
    const emu = await montar();

    await act(async () => {
      emu.atual.setFastForward(5);
    });

    expect(multiplicadores.at(-1)).toBe(5);
    expect(emu.atual.fastForward).toBe(5);
  });

  /**
   * O caso real, e o que a UI mostrava errado.
   *
   * `setTurbo` fechava sobre `fastForward`, entao sua identidade mudava a cada
   * mexida na barra. A PlayPage tem esse `setTurbo` nas dependencias do efeito
   * de atalhos E o chama na limpeza — logo o React rodava a limpeza ANTIGA,
   * que devolvia o core ao multiplicador ANTIGO um instante depois de
   * `setFastForward` ter acertado. O rotulo dizia 5x; o jogo rodava em 1x.
   *
   * Aqui a limpeza e reproduzida chamando a referencia capturada ANTES da
   * mudanca — que e literalmente o que o closure velho faz.
   */
  it("a limpeza do efeito antigo nao derruba a velocidade recem-escolhida", async () => {
    const emu = await montar();
    const setTurboAntigo = emu.atual.setTurbo;

    await act(async () => {
      emu.atual.setFastForward(5);
    });
    await act(async () => {
      setTurboAntigo(false);
    });

    expect(multiplicadores.at(-1)).toBe(5);
  });

  /** O turbo e impulso momentaneo: ao soltar, volta para o que a barra diz. */
  it("o turbo sobe e volta para o valor da barra", async () => {
    const emu = await montar();

    await act(async () => {
      emu.atual.setFastForward(3);
    });
    await act(async () => {
      emu.atual.setTurbo(true);
    });
    const durante = multiplicadores.at(-1);

    await act(async () => {
      emu.atual.setTurbo(false);
    });

    expect(durante).toBeGreaterThan(3);
    expect(multiplicadores.at(-1)).toBe(3);
  });
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
