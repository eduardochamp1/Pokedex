import { describe, expect, it } from "vitest";
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
      "/favicon.svg",
      "/index.html",
      "/logo192.png",
      "/logo512.png",
      "/manifest.json",
    ]);
  });
});
