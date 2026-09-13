/**
 * Separa de App.css os blocos que pertencem a uma unica rota.
 *
 * Feito por script e nao a mao porque sao 140 seletores `.play-*` espalhados
 * por 1.400 linhas: recortar no olho convida a trocar a ordem de duas regras e
 * quebrar a cascata em algum canto que nenhum teste pega.
 *
 * A regra de decisao e conservadora: um bloco so sai se TODOS os seletores dele
 * comecarem com o prefixo. Qualquer bloco que misture prefixo com outra coisa
 * fica onde esta.
 *
 * Uso: node scripts/split-route-css.mjs <prefixo> <arquivo-destino>
 */
import { readFile, writeFile } from "node:fs/promises";

const [, , prefix, outFile] = process.argv;
if (!prefix || !outFile) {
  console.error("uso: node scripts/split-route-css.mjs <.prefixo-> <destino.css>");
  process.exit(1);
}

const SOURCE = "src/App.css";
const css = await readFile(SOURCE, "utf8");

/** Fatia o CSS em pedacos de topo, preservando comentarios e ordem. */
function topLevelChunks(text) {
  const chunks = [];
  let i = 0;
  let start = 0;
  let depth = 0;
  let inComment = false;

  while (i < text.length) {
    if (!inComment && text.startsWith("/*", i)) {
      inComment = true;
      i += 2;
      continue;
    }
    if (inComment) {
      if (text.startsWith("*/", i)) {
        inComment = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        chunks.push(text.slice(start, i + 1));
        start = i + 1;
      }
    }
    i += 1;
  }
  if (start < text.length) chunks.push(text.slice(start));
  return chunks;
}

/** Seletores de um bloco simples (tudo antes da primeira chave). */
function selectorsOf(chunk) {
  const head = chunk.slice(0, chunk.indexOf("{"));
  // Tira comentarios do cabecalho para nao confundir a divisao por virgula.
  return head
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const isAtRule = (chunk) => chunk.trimStart().startsWith("@");
const belongs = (sel) => sel.startsWith(prefix);

/** Um bloco simples sai se todos os seletores forem do prefixo. */
function simpleBelongs(chunk) {
  const sels = selectorsOf(chunk);
  return sels.length > 0 && sels.every(belongs);
}

const kept = [];
const moved = [];

for (const chunk of topLevelChunks(css)) {
  if (!chunk.trim()) {
    kept.push(chunk);
    continue;
  }

  if (isAtRule(chunk)) {
    const head = chunk.slice(0, chunk.indexOf("{"));
    // Keyframes nao tem seletor de elemento: so sai se o nome tiver o prefixo.
    if (/^\s*@keyframes/.test(head)) {
      const name = head.replace(/^\s*@keyframes\s+/, "").trim();
      (name.startsWith(prefix.slice(1)) ? moved : kept).push(chunk);
      continue;
    }
    // Media/supports: separa as regras de dentro.
    const body = chunk.slice(chunk.indexOf("{") + 1, chunk.lastIndexOf("}"));
    const inner = topLevelChunks(body);
    const innerMoved = [];
    const innerKept = [];
    for (const rule of inner) {
      if (!rule.trim()) {
        innerKept.push(rule);
        continue;
      }
      (simpleBelongs(rule) ? innerMoved : innerKept).push(rule);
    }
    if (innerMoved.length > 0) {
      moved.push(`${head.trim()} {${innerMoved.join("")}\n}`);
    }
    if (innerKept.some((r) => r.trim())) {
      kept.push(`${head}{${innerKept.join("")}}`);
    }
    continue;
  }

  (simpleBelongs(chunk) ? moved : kept).push(chunk);
}

const header = `/*
 * Estilos exclusivos de "${prefix}*", separados de App.css por
 * scripts/split-route-css.mjs.
 *
 * Ficam aqui para serem carregados junto com a rota que os usa, em vez de
 * entrarem no CSS que toda visita baixa. A ordem entre eles e a mesma que
 * tinham no arquivo original — e o que preserva a cascata.
 */
`;

await writeFile(outFile, header + moved.join("").trimStart() + "\n", "utf8");
await writeFile(SOURCE, kept.join(""), "utf8");

console.log(`blocos movidos: ${moved.length}`);
console.log(`blocos mantidos: ${kept.filter((c) => c.trim()).length}`);
