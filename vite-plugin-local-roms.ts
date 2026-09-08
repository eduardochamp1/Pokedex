import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import type { Connect, Plugin, ViteDevServer, PreviewServer } from "vite";

/**
 * Pastas locais do emulador — servidas SO em dev e preview.
 *
 * Por que um plugin em vez de `public/`: qualquer coisa em `public/` e copiada
 * para `dist/` no build, ou seja, o deploy passaria a distribuir as ROMs. Aqui
 * nao existe hook de build: os arquivos ficam alcancaveis na sua maquina, e o
 * artefato de producao nao os contem.
 *
 * Rotas (todas ausentes em producao — a pagina degrada para o seletor de
 * arquivo e para o IndexedDB):
 *
 *   GET /local-roms.json        -> [{ fileName, size }]  (recursivo)
 *   GET /local-roms/<caminho>   -> bytes da ROM
 *   GET /local-saves.json       -> [{ fileName, size, modified }]
 *   GET /local-saves/<arquivo>  -> bytes do save
 *   PUT /local-saves/<arquivo>  -> grava o save em disco
 *
 * O PUT e o que faz os saves durarem de verdade: sem ele o progresso vive so
 * no IndexedDB do navegador, que sobrevive a recarregar mas pode ser descartado
 * sob pressao de disco ou por "limpar dados do site".
 */

const ROMS_DIR = "roms";
const SAVES_DIR = "saves";
const ROM_EXT = new Set([".gb", ".gbc", ".gba"]);
/** `.sav` = save de bateria; `.ss1`..`.ss9` = save states; `.ss` = automatico. */
const SAVE_EXT = /\.(sav|ss[0-9]?)$/i;
/** Teto por arquivo de save: um .sav de GBA tem 128 kB; state, alguns MB. */
const MAX_SAVE_BYTES = 32 * 1024 * 1024;

interface Entry {
  fileName: string;
  size: number;
  modified?: number;
}

/**
 * Resolve um caminho pedido pela URL dentro de `base`, recusando qualquer coisa
 * que escape (`../`, caminho absoluto, link para fora).
 */
function safeResolve(base: string, requested: string): string | null {
  const clean = requested.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.split("/").some((part) => part === "..")) return null;
  const target = resolve(base, clean);
  const rel = relative(base, target);
  if (!rel || rel.startsWith("..") || rel.startsWith(sep)) return null;
  return target;
}

/** Varre um diretorio recursivamente, devolvendo caminhos relativos. */
async function walk(
  dir: string,
  accept: (name: string) => boolean,
  prefix = "",
  depth = 0
): Promise<Entry[]> {
  if (depth > 4) return []; // guarda contra hierarquia absurda / ciclos
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return []; // pasta nao existe: sem biblioteca local, sem erro
  }

  const out: Entry[] = [];
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    let info;
    try {
      info = await stat(full);
    } catch {
      continue; // sumiu entre readdir e stat
    }
    if (info.isDirectory()) {
      out.push(...(await walk(full, accept, `${prefix}${name}/`, depth + 1)));
    } else if (info.isFile() && accept(name)) {
      out.push({
        fileName: `${prefix}${name}`,
        size: info.size,
        modified: info.mtimeMs,
      });
    }
  }
  return out;
}

function json(res: Parameters<Connect.NextHandleFunction>[1], body: unknown) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function notFound(res: Parameters<Connect.NextHandleFunction>[1]) {
  res.statusCode = 404;
  res.end("Not found");
}

/** Le o corpo da requisicao com teto de tamanho. */
function readBody(
  req: Parameters<Connect.NextHandleFunction>[0],
  limit: number
): Promise<Buffer | null> {
  return new Promise((done) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > limit) {
        done(null);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => done(Buffer.concat(chunks)));
    req.on("error", () => done(null));
  });
}

function middleware(root: string): Connect.NextHandleFunction {
  const romsDir = resolve(root, ROMS_DIR);
  const savesDir = resolve(root, SAVES_DIR);

  return (req, res, next) => {
    const rawUrl = req.url ?? "";
    const [path] = rawUrl.split("?");
    const method = (req.method ?? "GET").toUpperCase();

    // ---- manifestos ----
    if (path === "/local-roms.json") {
      walk(romsDir, (n) => ROM_EXT.has(extname(n).toLowerCase()))
        .then((list) =>
          json(
            res,
            list.sort((a, b) => a.fileName.localeCompare(b.fileName))
          )
        )
        .catch(next);
      return;
    }

    if (path === "/local-saves.json") {
      walk(savesDir, (n) => SAVE_EXT.test(n))
        .then((list) =>
          json(
            res,
            list.sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0))
          )
        )
        .catch(next);
      return;
    }

    // ---- ROMs (somente leitura) ----
    if (path.startsWith("/local-roms/")) {
      const target = safeResolve(
        romsDir,
        decodeURIComponent(path.slice("/local-roms/".length))
      );
      if (!target || !ROM_EXT.has(extname(target).toLowerCase())) {
        notFound(res);
        return;
      }
      readFile(target).then(
        (buffer) => {
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader("Content-Length", String(buffer.length));
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
          res.end(buffer);
        },
        () => notFound(res)
      );
      return;
    }

    // ---- saves (leitura e escrita) ----
    if (path.startsWith("/local-saves/")) {
      const name = decodeURIComponent(path.slice("/local-saves/".length));
      const target = safeResolve(savesDir, name);
      if (!target || !SAVE_EXT.test(target)) {
        notFound(res);
        return;
      }

      if (method === "GET") {
        readFile(target).then(
          (buffer) => {
            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader("Content-Length", String(buffer.length));
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
            res.end(buffer);
          },
          () => notFound(res)
        );
        return;
      }

      if (method === "PUT") {
        readBody(req, MAX_SAVE_BYTES).then(async (body) => {
          if (!body) {
            res.statusCode = 413;
            res.end("Save grande demais");
            return;
          }
          try {
            await mkdir(savesDir, { recursive: true });
            // Grava em temporario e renomeia por cima seria o ideal; aqui o
            // writeFile direto basta e mantem o codigo simples.
            await writeFile(target, body);
            json(res, { ok: true, fileName: name, size: body.length });
          } catch (error) {
            res.statusCode = 500;
            res.end(error instanceof Error ? error.message : "erro ao gravar");
          }
        });
        return;
      }

      res.statusCode = 405;
      res.end("Method not allowed");
      return;
    }

    next();
  };
}

export function localRoms(): Plugin {
  return {
    name: "local-roms",
    apply: (_config, env) => env.command === "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware(server.config.root));
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(middleware(server.config.root));
    },
  };
}

/**
 * Garante que o core do emulador esteja em `public/emulator/` antes de servir
 * ou buildar.
 *
 * Antes isso dependia dos hooks `predev`/`prebuild` do npm — e `npm start`
 * (que e o que o .claude/launch.json roda) nao tem `prestart`, entao quem
 * subisse por ali ficava sem o core. Como `public/emulator/` e gitignorado,
 * um clone limpo + `npm start` dava erro de carregamento.
 *
 * No hook do Vite o problema desaparece: vale para dev, start, build e preview,
 * e tambem para quem chama `vite` direto.
 */
export function emulatorCore(): Plugin {
  const FILES = ["mgba.js", "mgba.wasm"];

  return {
    name: "emulator-core",
    async buildStart() {
      const root = process.cwd();
      const from = resolve(
        root,
        "node_modules",
        "@thenick775",
        "mgba-wasm",
        "dist"
      );
      const to = resolve(root, "public", "emulator");

      try {
        await stat(from);
      } catch {
        this.warn(
          "Core do emulador não encontrado em node_modules — rode `npm install`. A rota /jogar vai avisar."
        );
        return;
      }

      await mkdir(to, { recursive: true });

      for (const file of FILES) {
        const src = join(from, file);
        const dest = join(to, file);
        try {
          // Copia so quando muda de tamanho: nao reescreve 1,8 MB a cada start.
          const [a, b] = await Promise.all([stat(src), stat(dest)]);
          if (a.size === b.size) continue;
        } catch {
          // destino ainda nao existe — copia
        }
        await copyFile(src, dest);
        this.info?.(`emulator-core: ${file} copiado`);
      }
    },
  };
}
