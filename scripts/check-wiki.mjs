/**
 * Confere se todo campo `wiki` dos verbetes curados aponta para um artigo de
 * verdade na Bulbapedia.
 *
 * Tres defeitos diferentes, e so o primeiro e obvio:
 *
 *   - titulo que nao existe: a fonte citada abre em pagina vazia;
 *   - titulo que e redirect: funciona hoje e quebra quando a wiki reorganiza;
 *   - titulo que e pagina de desambiguacao: o link abre numa lista de "voce
 *     quis dizer", que nao e fonte de nada. Foi o caso de "Mirage Island",
 *     que passou meses citado assim — existe, nao e redirect, e mesmo assim
 *     nao serve. O artigo certo era "Mirage Island (Generation III)".
 *
 * Fica fora do vitest de proposito, como o check-names: depende de rede, e
 * teste que depende de rede falha por motivo errado. Roda com
 * `npm run wiki:check`.
 */
import { readFileSync, readdirSync } from "node:fs";

const API = "https://bulbapedia.bulbagarden.net/w/api.php";
const UA = "pokedex/1.0 (projeto pessoal; validacao de fontes citadas)";

/** Todo titulo citado em src/data/*.ts, com o arquivo em que aparece. */
function lerTitulos() {
  const usos = new Map();
  const arquivos = readdirSync("src/data").filter(
    (f) => f.endsWith(".ts") && !f.includes("test")
  );
  for (const f of arquivos) {
    const src = readFileSync(`src/data/${f}`, "utf8");
    for (const m of src.matchAll(/wiki:\s*"([^"]+)"/g)) {
      if (!usos.has(m[1])) usos.set(m[1], new Set());
      usos.get(m[1]).add(f);
    }
  }
  return usos;
}

const lote = (a, n) =>
  a.reduce((o, x, i) => ((o[(i / n) | 0] ??= []).push(x), o), []);

const usos = lerTitulos();
const titulos = [...usos.keys()];
const problemas = [];

for (const grupo of lote(titulos, 10)) {
  const u = new URL(API);
  u.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    titles: grupo.join("|"),
  });
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) {
    console.error(`Bulbapedia respondeu ${r.status} — não dá para conferir agora.`);
    process.exit(2);
  }
  const q = (await r.json()).query;

  // `redirects` e `normalized` dizem de onde a API saiu para chegar no artigo.
  const veioDeRedirect = new Map((q.redirects ?? []).map((x) => [x.to, x.from]));
  const normalizado = new Map((q.normalized ?? []).map((x) => [x.to, x.from]));

  for (const p of q.pages ?? []) {
    const original =
      veioDeRedirect.get(p.title) ?? normalizado.get(p.title) ?? p.title;
    if (p.missing) {
      problemas.push([original, "não existe"]);
      continue;
    }
    if (veioDeRedirect.has(p.title)) {
      problemas.push([original, `é redirect para "${p.title}"`]);
      continue;
    }
    const texto = p.revisions?.[0]?.slots?.main?.content ?? "";
    if (/\{\{disambig/i.test(texto)) {
      problemas.push([original, "é página de desambiguação"]);
    }
  }
}

console.log(`${titulos.length} títulos citados em src/data/`);

if (problemas.length) {
  console.log(`\nFontes que não servem (${problemas.length}):`);
  for (const [titulo, motivo] of problemas) {
    console.log(`  ${titulo}: ${motivo}   [${[...usos.get(titulo)].join(", ")}]`);
  }
  process.exit(1);
}
console.log("\nTodos apontam para um artigo real, sem redirect e sem desambiguação.");
