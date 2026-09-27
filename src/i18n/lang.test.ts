import { describe, expect, it, beforeEach, vi } from "vitest";
import { detectLang, getLang, setLang, reloadLang, tr, localeOf } from "./lang";

const memory: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(memory)) delete memory[k];
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (k in memory ? memory[k] : null),
    setItem: (k: string, v: string) => {
      memory[k] = v;
    },
  } as unknown as Storage);
  vi.stubGlobal("navigator", { language: "pt-BR", languages: ["pt-BR"] });
  vi.stubGlobal("document", { documentElement: { lang: "" } });
  reloadLang();
});

describe("detectLang", () => {
  it("português do navegador vira pt, o resto en", () => {
    expect(detectLang(["pt-BR"])).toBe("pt");
    expect(detectLang(["pt-PT"])).toBe("pt");
    expect(detectLang(["en-US"])).toBe("en");
    expect(detectLang(["es-ES", "pt-BR"])).toBe("pt");
    expect(detectLang(["fr"])).toBe("en");
    expect(detectLang([])).toBe("pt");
  });
});

describe("store", () => {
  it("começa pelo navegador", () => {
    expect(getLang()).toBe("pt");
  });

  it("a escolha persiste e manda no navegador", () => {
    setLang("en");
    expect(getLang()).toBe("en");
    reloadLang();
    expect(getLang()).toBe("en");
    expect(memory["pokedex:lang"]).toBe("en");
  });

  it("marca o <html lang>", () => {
    setLang("en");
    expect(document.documentElement.lang).toBe("en");
    setLang("pt");
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("valor inválido gravado é ignorado", () => {
    memory["pokedex:lang"] = "klingon";
    reloadLang();
    expect(getLang()).toBe("pt");
  });
});

describe("tr e localeOf", () => {
  it("escolhe pelo idioma", () => {
    expect(tr("pt", "Buscar", "Search")).toBe("Buscar");
    expect(tr("en", "Buscar", "Search")).toBe("Search");
  });

  it("locale de formatação", () => {
    expect(localeOf("pt")).toBe("pt-BR");
    expect(localeOf("en")).toBe("en-US");
  });
});
