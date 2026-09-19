/**
 * Confere se todo nome de pokémon que o site usa resolve para um slug real da
 * PokéAPI.
 *
 * Cobre duas frentes com a mesma causa. A primeira são os ~330 nomes curados
 * da lore: quando um deles não bate com o slug da API, nada quebra — o chip
 * só abre com "?" no lugar do sprite. A segunda são as nove gerações do
 * filtro da Pokédex, e essa é a mais traiçoeira: quando uma espécie não
 * resolve, ela some da grade em silêncio e o contador passa a mostrar um
 * total menor do que o número que o próprio site publica na aba de Gerações.
 * Foi assim que a Gen 9 exibia 114 de 120 — sete espécies que a API só serve
 * com o sufixo da forma default (maushold-family-of-four, palafin-zero...).
 *
 * Fica fora do vitest de propósito: depende de rede, e teste que depende de
 * rede falha por motivo errado. Roda com `npm run names:check`.
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
  const campos =
    /(?:pokemons|inhabitants|signature|names|pokemon)\s*:\s*(?:\[([^\]]*)\]|"([^"]+)")/g;
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

/** Ids das dex regionais que o filtro oferece. */
function lerDexRegionais() {
  const src = readFileSync("src/hooks/usePokemon.ts", "utf8");
  const ini = src.indexOf("export const REGIONAL_DEXES");
  const fim = src.indexOf("];", ini);
  if (ini < 0 || fim < 0) throw new Error("não achei REGIONAL_DEXES em usePokemon.ts");
  return [...src.slice(ini, fim).matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Quantos pokémon cada geração declara em generations.ts. */
function lerDeclarado() {
  const src = readFileSync("src/data/generations.ts", "utf8");
  return [...src.matchAll(/newPokemons:\s*(\d+)/g)].map((m) => Number(m[1]));
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

// ---------- lore ----------
const semSprite = [...usos.keys()].filter((n) => !indice.has(resolver(n))).sort();
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

// ---------- gerações ----------
const declarado = lerDeclarado();
const geracoes = [];
for (let id = 1; id <= declarado.length; id++) {
  const r = await fetch(`https://pokeapi.co/api/v2/generation/${id}`);
  if (!r.ok) {
    console.error(`PokéAPI respondeu ${r.status} na geração ${id}.`);
    process.exit(2);
  }
  const especies = (await r.json()).pokemon_species.map((e) => e.name);
  const somem = especies.filter((e) => !indice.has(resolver(e)));
  geracoes.push({ id, declarado: declarado[id - 1], api: especies.length, somem });
}

console.log("\ngeração | declarado | API | na tela");
for (const g of geracoes) {
  const naTela = g.api - g.somem.length;
  const ok = g.declarado === g.api && g.somem.length === 0;
  console.log(
    `   ${g.id}    |   ${String(g.declarado).padStart(4)}    |${String(g.api).padStart(5)}|${String(naTela).padStart(6)}${ok ? "" : "   <-- diverge"}`,
  );
}

const gensRuins = geracoes.filter((g) => g.declarado !== g.api || g.somem.length);
if (gensRuins.length) {
  console.log("\nGerações com divergência:");
  for (const g of gensRuins) {
    if (g.declarado !== g.api) {
      console.log(`  gen ${g.id}: generations.ts diz ${g.declarado}, a API tem ${g.api}`);
    }
    if (g.somem.length) {
      console.log(`  gen ${g.id}: somem do filtro (${g.somem.length}): ${g.somem.join(", ")}`);
    }
  }
}

// ---------- dex regionais ----------
// Mesma falha silenciosa da geração: espécie que não resolve some da grade, e
// o contador passa a mostrar menos do que a dex realmente tem.
const dexRuins = [];
for (const dex of lerDexRegionais()) {
  const r = await fetch(`https://pokeapi.co/api/v2/pokedex/${dex}`);
  if (!r.ok) {
    dexRuins.push({ dex, erro: `HTTP ${r.status}` });
    continue;
  }
  const especies = (await r.json()).pokemon_entries.map((e) => e.pokemon_species.name);
  const somem = especies.filter((e) => !indice.has(resolver(e)));
  if (somem.length) dexRuins.push({ dex, somem });
}

if (dexRuins.length) {
  console.log("\nDex regionais com problema:");
  for (const d of dexRuins) {
    const detalhe = d.erro ?? `somem ${d.somem.length} (${d.somem.join(", ")})`;
    console.log(`  ${d.dex}: ${detalhe}`);
  }
} else {
  console.log(`\n${lerDexRegionais().length} dex regionais conferidas, nenhuma perde espécie.`);
}

if (semSprite.length || aliasQuebrado.length || gensRuins.length || dexRuins.length) {
  process.exit(1);
}
console.log("\nTudo fecha: lore, gerações e dex regionais.");
