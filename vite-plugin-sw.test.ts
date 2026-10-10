import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { injectPrecache, precacheList } from "./vite-plugin-sw.ts";

const SW = `const VERSION = "__SW_VERSION__";
const PRECACHE = /*__SW_PRECACHE__*/ [];
self.addEventListener("install", () => {});`;

describe("injectPrecache", () => {
  it("troca a versão e a lista", () => {
    const out = injectPrecache(SW, ["/index.html", "/assets/a.js"], "abc123");
    expect(out).toContain('const VERSION = "abc123";');
    expect(out).toContain('const PRECACHE = ["/index.html","/assets/a.js"];');
    expect(out).not.toContain("__SW_");
  });

  /** Sem os marcadores o sw.js mudou de forma: melhor quebrar o build que publicar um worker sem lista. */
  it("falha alto se os marcadores sumiram", () => {
    expect(() => injectPrecache("const VERSION = 'v1';", [], "x")).toThrow(/marcador/);
  });
});

describe("precacheList", () => {
  it("leva o bundle e os arquivos de public/ que o app precisa, sem mapas", () => {
    const lista = precacheList(["index.html", "assets/a.js", "assets/a.js.map", "assets/b.css", "assets/m.wasm"]);
    expect(lista).toEqual([
      "/",
      "/assets/a.js",
      "/assets/b.css",
      "/assets/m.wasm",
      "/favicon.ico",
      "/index.html",
      "/logo192.png",
      "/logo512.png",
      "/manifest.json",
    ]);
  });
});

/**
 * O worker de verdade, carregado com um `self` de mentira só para capturar o
 * handler de fetch. O que interessa aqui é quem ele deixa passar direto.
 */
describe("sw.js: o que não passa pelo cache", () => {
  const origin = "http://localhost:4173";

  async function fetchHandler() {
    const source = await readFile(new URL("./public/sw.js", import.meta.url), "utf8");
    const handlers = new Map<string, (event: unknown) => void>();
    const self = {
      location: { origin },
      addEventListener: (type: string, fn: (event: unknown) => void) => handlers.set(type, fn),
    };
    new Function("self", "caches", "fetch", source)(self, {}, () => Promise.reject(new Error("sem rede")));
    return handlers.get("fetch")!;
  }

  function pedido(path: string, method = "GET") {
    let respondeu = false;
    const event = {
      request: { method, url: `${origin}${path}`, mode: "cors" },
      respondWith: (resposta: Promise<unknown>) => {
        respondeu = true;
        // O handler real vai tentar abrir o cache de mentira; a rejeição não interessa aqui.
        Promise.resolve(resposta).catch(() => undefined);
      },
      waitUntil: () => undefined,
    };
    return { event, respondeu: () => respondeu };
  }

  /** Save vindo do cache é o progresso de antes da última gravação. */
  it.each(["/local-saves/Emerald.sav", "/local-saves.json", "/local-roms/Emerald.gba", "/local-roms.json"])(
    "deixa %s ir direto para a rede",
    async (path) => {
      const handler = await fetchHandler();
      const p = pedido(path);
      handler(p.event);
      expect(p.respondeu()).toBe(false);
    }
  );

  it("continua atendendo o resto da mesma origem", async () => {
    const handler = await fetchHandler();
    const p = pedido("/sprites/pokemon/1.png");
    handler(p.event);
    expect(p.respondeu()).toBe(true);
  });
});
