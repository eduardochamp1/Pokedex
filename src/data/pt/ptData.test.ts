import { describe, expect, it } from "vitest";
import flavor from "./flavor.json";
import abilities from "./abilities.json";
import moves from "./moves.json";
import moveDesc from "./move-desc.json";

const INGLES = /\b(the|with|this|that|when|which|their|from)\b/i;

describe("traduções do que a PokéAPI não tem em português", () => {
  it("há um texto da Pokédex para cada uma das 1025 espécies", () => {
    const f = flavor as Record<string, string>;
    for (let id = 1; id <= 1025; id++) expect(f[id], `espécie ${id}`).toBeTruthy();
    expect(Object.keys(f)).toHaveLength(1025);
  });

  it("nenhum texto da Pokédex ficou em inglês ou vazio", () => {
    for (const [id, texto] of Object.entries(flavor as Record<string, string>)) {
      expect(texto.trim().length, `espécie ${id}`).toBeGreaterThan(10);
      expect(INGLES.test(texto), `espécie ${id}: ${texto}`).toBe(false);
    }
  });

  it("toda habilidade tem nome e resumo, e nenhum marcador de cópia sobrou", () => {
    const lista = Object.entries(abilities as Record<string, { name: string; short: string; effect?: string }>);
    expect(lista.length).toBeGreaterThanOrEqual(300);
    for (const [slug, a] of lista) {
      expect(a.name, slug).toBeTruthy();
      expect(a.short, slug).toBeTruthy();
      expect(a.effect ?? "", slug).not.toContain("@copy");
    }
  });

  it("toda habilidade tem texto de sabor, em português", () => {
    for (const [slug, a] of Object.entries(abilities as Record<string, { flavor?: string }>)) {
      expect((a.flavor ?? "").trim().length, slug).toBeGreaterThan(10);
      expect(INGLES.test(a.flavor ?? ""), slug + ": " + a.flavor).toBe(false);
    }
  });

  it("os golpes têm nome, e os clássicos saem como o público conhece", () => {
    const m = moves as Record<string, string>;
    expect(Object.keys(m).length).toBeGreaterThanOrEqual(900);
    for (const [slug, nome] of Object.entries(m)) expect(nome.trim(), slug).toBeTruthy();
    expect(m["thunder-shock"]).toBe("Choque do Trovão");
    expect(m["flamethrower"]).toBe("Lança-Chamas");
    expect(m["tackle"]).toBe("Investida");
  });

  it("as descrições de golpe existem, em português, só para golpes conhecidos", () => {
    const m = moves as Record<string, string>;
    const d = moveDesc as Record<string, string>;
    expect(Object.keys(d).length).toBeGreaterThanOrEqual(900);
    for (const [slug, texto] of Object.entries(d)) {
      expect(m[slug], slug).toBeTruthy();
      expect(texto.trim().length, slug).toBeGreaterThan(10);
      expect(INGLES.test(texto), slug + ": " + texto).toBe(false);
    }
  });
});
