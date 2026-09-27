import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Injeta no `sw.js` a lista de arquivos do build e uma versão.
 *
 * O worker é escrito à mão em `public/sw.js` e copiado como está — então não
 * sabe os nomes com hash que o Vite gerou. Sem a lista, só ia para o cache o
 * que a pessoa já tinha aberto: a Lore abria offline, o Quiz nunca visitado
 * não. Com ela, a instalação guarda o app inteiro (~2,9 MB, o wasm do
 * emulador incluído) e toda rota abre sem rede.
 *
 * A versão é um hash da lista: muda a cada deploy com arquivo novo, e é isso
 * que faz o worker novo instalar e o cache do build anterior ser apagado.
 */

const MARCA_VERSAO = '"__SW_VERSION__"';
const MARCA_LISTA = "/*__SW_PRECACHE__*/ []";

/** Arquivos de `public/` que o app usa fora do bundle. */
const DO_PUBLIC = ["/favicon.ico", "/logo192.png", "/logo512.png", "/manifest.json"];

export function precacheList(bundleFiles: string[]): string[] {
  const doBuild = bundleFiles.filter((f) => !f.endsWith(".map")).map((f) => `/${f}`);
  // "/" também: a navegação offline pede a raiz, não "/index.html".
  return [...new Set(["/", ...doBuild, ...DO_PUBLIC])].sort();
}

export function injectPrecache(source: string, files: string[], version: string): string {
  if (!source.includes(MARCA_VERSAO) || !source.includes(MARCA_LISTA)) {
    throw new Error(
      `sw.js sem os marcadores ${MARCA_VERSAO} e ${MARCA_LISTA}: o worker sairia sem lista de pré-cache`
    );
  }
  return source.replace(MARCA_VERSAO, JSON.stringify(version)).replace(MARCA_LISTA, JSON.stringify(files));
}

export function serviceWorkerPrecache(): Plugin {
  let outDir = "dist";
  return {
    name: "pokedex-sw-precache",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async writeBundle(_options, bundle) {
      const files = precacheList(Object.keys(bundle));
      const version = createHash("sha256").update(files.join("\n")).digest("hex").slice(0, 12);
      const caminho = resolve(outDir, "sw.js");
      const source = await readFile(caminho, "utf8");
      await writeFile(caminho, injectPrecache(source, files, version));
    },
  };
}
