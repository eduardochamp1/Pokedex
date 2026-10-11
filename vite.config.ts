import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { serviceWorkerPrecache } from "./vite-plugin-sw.ts";

/**
 * Porta 3001, e nao 3000: a 3000 ficou com o projeto Jogar (o emulador, que
 * saiu daqui), porque os saves dele moram no IndexedDB daquela origem.
 */
export default defineConfig({
  plugins: [react(), serviceWorkerPrecache()],
  server: {
    port: 3001,
    open: false,
  },
});
