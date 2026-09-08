import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CORE_URL, READY_EVENT, buildLoaderScript } from "./core";

/**
 * Regressao: o core mora em `public/emulator/`, e arquivo em `public/` nao pode
 * ser alvo de `import()` no codigo-fonte. Em dev o Vite anexa `?import` a URL,
 * tenta transformar, ve que esta em publicDir e responde 500:
 *
 *   "This file is in /public and will be copied as-is during build without
 *    going through the plugin transforms, and therefore should not be imported
 *    from source code. It can only be referenced via HTML tags."
 *
 * O `/* @vite-ignore *\/` nao evita isso. A correcao foi injetar o `import()`
 * dentro de uma tag <script>, onde o Vite nao le. Estes testes guardam a
 * correcao nas duas pontas: o texto gerado e o fonte que o gera.
 */

const CORE_SOURCE = readFileSync(
  join(__dirname, "core.ts"),
  "utf8"
);

describe("buildLoaderScript", () => {
  const script = buildLoaderScript(CORE_URL, READY_EVENT);

  it("contém o import da URL do core", () => {
    expect(script).toContain(`import("${CORE_URL}")`);
  });

  it("expõe a fábrica no window, aceitando default ou namespace", () => {
    expect(script).toContain("window.__mgbaCoreFactory__");
    expect(script).toContain("m.default || m");
  });

  it("registra o erro em vez de engolir", () => {
    expect(script).toContain("window.__mgbaCoreError__");
  });

  it("sempre avisa o fim, deu certo ou não", () => {
    expect(script).toContain(".finally(");
    expect(script).toContain(`new Event("${READY_EVENT}")`);
  });

  it("cita URL e evento com JSON.stringify, sem concatenar cru", () => {
    const script = buildLoaderScript('/a"b.js', 'ev"ento');
    expect(script).toContain('import("/a\\"b.js")');
    expect(script).toContain('new Event("ev\\"ento")');
  });
});

/**
 * Sem comentarios: o padrao proibido pode vir com `/* @vite-ignore *\/` no meio
 * (`import(/* ... *\/ CORE_URL)`), e foi exatamente assim que a primeira versao
 * deste guarda deixou passar a regressao.
 */
const CORE_SOURCE_SEM_COMENTARIOS = CORE_SOURCE.replace(
  /\/\*[\s\S]*?\*\//g,
  " "
).replace(/\/\/[^\n]*/g, " ");

describe("fonte do carregador", () => {
  it("não tem import() da URL do core como expressão no fonte", () => {
    const proibido = /\bimport\s*\(\s*(CORE_URL|["'`]\/emulator)/g;
    expect(CORE_SOURCE_SEM_COMENTARIOS.match(proibido)).toBeNull();
  });

  it("o import mora dentro de um template, não do módulo", () => {
    // buildLoaderScript monta a string; a única ocorrência de import( no
    // arquivo é dentro dela.
    expect(CORE_SOURCE).toContain("import(${JSON.stringify(coreUrl)})");
  });

  it("o core é carregado por tag <script>, como o Vite exige", () => {
    expect(CORE_SOURCE).toContain('document.createElement("script")');
    expect(CORE_SOURCE).toContain("document.head.appendChild(script)");
  });

  it("a URL do core aponta para o arquivo servido de public/", () => {
    expect(CORE_URL).toBe("/emulator/mgba.js");
  });
});
