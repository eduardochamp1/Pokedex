#!/usr/bin/env node
/**
 * Baixa para `public/sprites/` os assets que o site usa para ilustrar a lore,
 * para o projeto nao depender de CDN de terceiros em runtime.
 *
 *   node scripts/fetch-sprites.mjs          # baixa o que falta
 *   node scripts/fetch-sprites.mjs --force  # rebaixa tudo
 *
 * O que vem:
 *   - sprites pixelados de todos os pokemon (~1.351 arquivos, ~1,6 MB)
 *   - sprites dos itens citados em src/data/items.ts (~40 arquivos, ~11 kB)
 *
 * O que NAO vem: o artwork oficial de 475px (~133 kB cada, ~176 MB no total).
 * Esse continua saindo da resposta da PokeAPI nas telas que ja buscam o
 * detalhe do pokemon.
 *
 * Fonte: github.com/PokeAPI/sprites — o mesmo CDN que a PokeAPI referencia.
 */
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPRITE_CDN =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";
const POKEAPI = "https://pokeapi.co/api/v2";
const OUT_POKEMON = join(ROOT, "public", "sprites", "pokemon");
const OUT_ITEMS = join(ROOT, "public", "sprites", "items");

const FORCE = process.argv.includes("--force");
const CONCURRENCY = 16;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

/** Baixa uma imagem; devolve "ok", "skip" (ja existe) ou "missing" (404). */
async function download(url, dest) {
  if (!FORCE && (await exists(dest))) return "skip";
  const res = await fetch(url);
  if (res.status === 404) return "missing";
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return "ok";
}

/** Roda `worker` sobre `items` com um teto de tarefas simultaneas. */
async function pool(items, worker) {
  const tally = { ok: 0, skip: 0, missing: 0 };
  let cursor = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      tally[await worker(item)]++;
    }
  });
  await Promise.all(runners);
  return tally;
}

function report(label, tally) {
  const parts = [`${tally.ok} baixados`];
  if (tally.skip) parts.push(`${tally.skip} já tinha`);
  if (tally.missing) parts.push(`${tally.missing} sem sprite no CDN`);
  console.log(`  ${label}: ${parts.join(", ")}`);
}

/** Extrai os apiSlug de src/data/items.ts sem precisar compilar TypeScript. */
async function itemSlugs() {
  const source = await readFile(join(ROOT, "src", "data", "items.ts"), "utf8");
  const slugs = new Set();
  for (const m of source.matchAll(/apiSlug:\s*"([a-z0-9-]+)"/g)) slugs.add(m[1]);
  return [...slugs].sort();
}

async function main() {
  await mkdir(OUT_POKEMON, { recursive: true });
  await mkdir(OUT_ITEMS, { recursive: true });

  console.log("Índice de pokémon…");
  const index = await fetchJson(`${POKEAPI}/pokemon?limit=100000`);
  const ids = index.results
    .map((r) => Number(r.url.match(/\/(\d+)\/?$/)?.[1]))
    .filter((id) => Number.isFinite(id));
  console.log(`  ${ids.length} pokémon`);

  console.log("Sprites de pokémon…");
  report(
    "pokémon",
    await pool(ids, (id) =>
      download(`${SPRITE_CDN}/pokemon/${id}.png`, join(OUT_POKEMON, `${id}.png`))
    )
  );

  const slugs = await itemSlugs();
  console.log(`Sprites de item (${slugs.length} slugs em items.ts)…`);
  report(
    "itens",
    await pool(slugs, (slug) =>
      download(`${SPRITE_CDN}/items/${slug}.png`, join(OUT_ITEMS, `${slug}.png`))
    )
  );

  console.log("Pronto.");
}

main().catch((error) => {
  console.error(`\nFalhou: ${error.message}`);
  process.exit(1);
});
