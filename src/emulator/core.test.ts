import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * O core e carregado como o gbajs3 carrega: `import` do pacote, e mais nada.
 *
 * Isso so funciona por causa de uma linha na `vite.config.ts` —
 * `optimizeDeps: { exclude: ["@thenick775/mgba-wasm"] }`. O `mgba.js` e glue do
 * Emscripten: ele sobe o worker de pthread a partir da URL do proprio script e
 * resolve o `.wasm` relativo a ela. O pre-bundle do esbuild reescreve o modulo
 * e o move, e as duas resolucoes quebram.
 *
 * A falha, quando alguem tirar o `exclude`, nao aparece no typecheck nem no
 * lint: a pagina simplesmente nao carrega o emulador, ou carrega sem threads.
 * Dai estes testes lerem os dois arquivos em vez de so importar o modulo.
 *
 * O que havia aqui antes guardava o caminho oposto: uma copia do core em
 * `public/emulator/` carregada por uma tag `<script>` injetada, porque arquivo
 * em `public/` nao pode ser alvo de `import()` no fonte. Aquele desvio saiu
 * inteiro.
 */
const FONTE_CORE = readFileSync(join(__dirname, "core.ts"), "utf8");
const FONTE_VITE = readFileSync(
  join(__dirname, "..", "..", "vite.config.ts"),
  "utf8"
);

const PACOTE = "@thenick775/mgba-wasm";

describe("carregamento do core", () => {
  it("importa a fábrica do pacote, sob demanda", () => {
    expect(FONTE_CORE).toContain(`await import("${PACOTE}")`);
  });

  it("cria o core com o canvas e monta o FS, como o gbajs3", () => {
    expect(FONTE_CORE).toContain("mGBA({ canvas: getCanvas() })");
    expect(FONTE_CORE).toContain("core.FSInit()");
  });

  /**
   * O desvio antigo, inteiro. Se qualquer um destes voltar, voltou junto o
   * problema de manter um caminho de carregamento so nosso.
   */
  it("não ressuscita a cópia em public/ nem o script injetado", () => {
    expect(FONTE_CORE).not.toContain('createElement("script")');
    expect(FONTE_CORE).not.toContain("__mgbaCoreFactory__");
    expect(FONTE_CORE).not.toContain("/emulator/mgba.js");
  });
});

describe("vite.config.ts", () => {
  /**
   * O teste mais importante deste arquivo: sem esta linha nada do resto vale.
   */
  it("mantém o core fora do pre-bundle", () => {
    expect(FONTE_VITE).toMatch(/optimizeDeps:\s*\{[\s\S]*?exclude:/);
    expect(FONTE_VITE).toContain(`"${PACOTE}"`);
  });

  /** Threads exigem SharedArrayBuffer, que exige pagina cross-origin isolated. */
  it("serve os headers de isolamento em dev e no preview", () => {
    expect(FONTE_VITE).toContain("Cross-Origin-Opener-Policy");
    expect(FONTE_VITE).toContain("Cross-Origin-Embedder-Policy");
  });
});
