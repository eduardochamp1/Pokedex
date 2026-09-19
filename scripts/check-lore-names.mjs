/**
 * Confere se todo pokémon citado na lore curada tem sprite.
 *
 * Os ~330 nomes em `src/data/*.ts` são escritos à mão. Quando um deles não
 * bate com o slug da PokéAPI, nada quebra: o chip só abre com "?" no lugar do
 * sprite, e ninguém percebe até olhar a tela certa. Foi assim que "frillish",
 * "jellicent", "pyroar" e "galarian-weezing" passaram — e o alias de
 * "ogerpon", que apontava para um slug que a API não serve mais, derrubou o
 * sprite dele em cinco arquivos de uma vez.
 *
 * Fica fora do vitest de propósito: depende de rede, e teste que depende de
 * rede falha por motivo errado. Roda com `npm run lore:check`.
 */
import { readFileSync, readdirSync } from "node:fs";

const INDEX_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000";

/** Lê a tabela de alias do api.ts sem importar o módulo (que é TypeScript). */
function lerAlias() {
  const src = readFileSync("src/api.ts", "utf8");
  const ini = src.indexOf("POKEMON_ALIAS");
  const fim = src.indexOf("export function resolveName");
  if (ini < 0 || fim < 0) throw new Error("não achei POKEMON_ALIAS em src/api.ts");
  return Object.fromEntries(
    [...src.slice(ini, fim).matchAll(/^\s*([a-z0-9-]+):\s*"([^"]+)"/gm)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

/** Todo nome de pokémon citado nos arquivos de dados, com onde ele aparece. */
function lerNomesCurados() {
  const campos = /(?:pokemons|inhabitants|signature|names|pokemon)\s*:\s*(?:\[([^\]]*)\]|"([^"]+)")/g;
  const usos = new Map();
  const arquivos = readdirSync("src/data").filter(
    (f) => f.endsWith(".ts") && !f.includes("test"),
  );
  for (const f of arquivos) {
    const src = readFileSync(`src/data/${f}`, "utf8");
    for (const m of src.matchAll(campos)) {
      const lista = (m[1] ?? m[2] ?? "")
        .split(",")
        .map((x) => x.replace(/["\s]/g, ""))
        .filter(Boolean);
      for (const nome of lista) {
        if (!usos.has(nome)) usos.set(nome, new Set());
        usos.get(nome).add(f);
      }
    }
  }
  return usos;
}

const alias = lerAlias();
const resolver = (n) => alias[n.toLowerCase().trim()] ?? n.toLowerCase().trim();
const usos = lerNomesCurados();

const resposta = await fetch(INDEX_URL);
if (!resposta.ok) {
  console.error(`PokéAPI respondeu ${resposta.status} — não dá para conferir agora.`);
  process.exit(2);
}
const indice = new Set((await resposta.json()).results.map((p) => p.name));

const semSprite = [...usos.keys()]
  .filter((n) => !indice.has(resolver(n)))
  .sort();
const aliasQuebrado = Object.entries(alias).filter(([, destino]) => !indice.has(destino));

console.log(`${usos.size} nomes curados · ${indice.size} slugs no índice da API`);

if (aliasQuebrado.length) {
  console.log(`\nAlias apontando para slug que a API não serve (${aliasQuebrado.length}):`);
  for (const [de, para] of aliasQuebrado) console.log(`  ${de} -> ${para}`);
}
if (semSprite.length) {
  console.log(`\nNomes que abrem sem sprite (${semSprite.length}):`);
  for (const n of semSprite) {
    console.log(`  ${n}  ->  ${resolver(n)}   [${[...usos.get(n)].join(", ")}]`);
  }
}

if (semSprite.length || aliasQuebrado.length) process.exit(1);
console.log("\nTodo nome curado resolve para um slug existente.");
