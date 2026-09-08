#!/usr/bin/env node
/**
 * Copia o core do emulador de node_modules para `public/emulator/`.
 *
 *   node scripts/copy-emulator-core.mjs
 *
 * Por que copiar em vez de importar pelo bundler: o runtime de threads do
 * Emscripten sobe seu worker de pthread a partir da URL do proprio script, e
 * o .wasm e resolvido relativo a ela. Servindo `mgba.js` e `mgba.wasm` lado a
 * lado de `public/`, os dois ficam same-origin com a pagina e o worker
 * inicializa — o que nao e garantido quando o Vite reescreve o modulo.
 *
 * Roda automaticamente antes de `dev` e de `build` (predev / prebuild).
 */
import { mkdir, copyFile, access, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = join(ROOT, "node_modules", "@thenick775", "mgba-wasm", "dist");
const TO = join(ROOT, "public", "emulator");

/** O .wasm.map fica de fora: 456 kB que so servem para debugar o core. */
const FILES = ["mgba.js", "mgba.wasm"];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(FROM))) {
    console.error(
      "Core não encontrado em node_modules.\n" +
        "Rode `npm install` antes — o emulador depende de @thenick775/mgba-wasm."
    );
    process.exit(1);
  }

  await mkdir(TO, { recursive: true });

  for (const file of FILES) {
    const from = join(FROM, file);
    const to = join(TO, file);

    // Copia so quando muda de tamanho: evita reescrever 1,8 MB a cada dev.
    if (await exists(to)) {
      const [a, b] = await Promise.all([stat(from), stat(to)]);
      if (a.size === b.size) {
        console.log(`  ${file}: já atualizado`);
        continue;
      }
    }

    await copyFile(from, to);
    const { size } = await stat(to);
    console.log(`  ${file}: copiado (${Math.round(size / 1024)} kB)`);
  }
}

main().catch((error) => {
  console.error(`\nFalhou: ${error.message}`);
  process.exit(1);
});
