import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localRoms } from "./vite-plugin-local-roms.ts";
import { serviceWorkerPrecache } from "./vite-plugin-sw.ts";

/**
 * O core do emulador (mGBA compilado para wasm) usa threads, e threads exigem
 * SharedArrayBuffer, que so existe em pagina cross-origin isolated. Por isso
 * estes dois headers em dev e no preview.
 *
 * Em producao o host precisa mandar os mesmos headers — ver public/_headers
 * (Netlify / Cloudflare Pages) e a seção de deploy no README. Sem eles o site
 * continua funcionando: so a rota /jogar detecta a falta e explica o que fazer.
 *
 * Consequencia: todo recurso cross-origin da pagina precisa ser CORS/CORP.
 * Os sprites ja sao locais; o artwork da PokeAPI e a folha do Google Fonts
 * levam crossorigin="anonymous".
 */
const crossOriginIsolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [react(), localRoms(), serviceWorkerPrecache()],
  /**
   * O core do emulador fica **fora** do pre-bundle do Vite.
   *
   * Isto vem do gbajs3, que roda este mesmo core em producao. O `mgba.js` e
   * glue do Emscripten: ele sobe o worker de pthread a partir da URL do
   * proprio script e resolve o `.wasm` relativo a ela. O pre-bundle do esbuild
   * reescreve o modulo e move o arquivo, e as duas resolucoes quebram.
   *
   * Com o `exclude`, o `import("@thenick775/mgba-wasm")` entrega o arquivo do
   * pacote como ele e, e o worker e o wasm sobem. Era este ajuste que faltava
   * para dispensar a copia manual em `public/emulator/`.
   */
  optimizeDeps: {
    exclude: ["@thenick775/mgba-wasm"],
  },
  server: {
    port: 3000,
    open: false,
    headers: crossOriginIsolationHeaders,
  },
  preview: {
    headers: crossOriginIsolationHeaders,
  },
});
