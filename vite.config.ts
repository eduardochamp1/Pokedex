import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { emulatorCore, localRoms } from "./vite-plugin-local-roms";

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
  plugins: [react(), emulatorCore(), localRoms()],
  server: {
    port: 3000,
    open: false,
    headers: crossOriginIsolationHeaders,
  },
  preview: {
    headers: crossOriginIsolationHeaders,
  },
});
